#!/usr/bin/env python

from operator import *
from sys import argv
from util import *
import json
import Queue
import thread
from util import load_json
from ws4py.client.threadedclient import WebSocketClient
import requests
import time

smap_query_url = "http://shell.storm.pm:8079/api/query"
smap_actuation_url = "http://shell.storm.pm:8079/add/apikey"

debug = False

class void:
    def __repr__(self):
        return "<void>"
void = void()

_ast_docs = []
_func_docs = []
_node_switch_table = {}
_func_switch_table = {}
_node_configs = {} #maps categories to lists of member nodes

class Interpreter:
    def __init__(self):
        self.nodes = {}
        self.wireV = {} # wire values
        self.wireS = {} # wire subscriptions
        self.ready_q = Queue.Queue(0)
        self.ready = set()
        self.smap_subscriptions_p = False #True when smap subscriptions are active
        self.smap_threads = [] #list of all smap subscription thr

    def run(self, ast):
        assert ast.get('type') == 'program'
        self.ready = set(ast.get('initial',[]))
        self.nodes = ast['nodes']
        self.wireS = ast['connections']
        #TODO: need to settle on some kind of name standard or fix this
        self.wireV = {"{}".format(name) : void for name in self.wireS}
        for node in self.ready:
            self.ready_q.put(node)
        #main execution loop.
        while not self.ready_q.empty() or self.smap_subscriptions_p:
            #TODO: catch errors
            if ast.get('shouldStop'):
                return 1
            try:
                node = self.ready_q.get(True, 2)
                self.ready.remove(node)
                node_ast = self.nodes.get(node)
                if node_ast:
                    fn = _node_switch_table.get(node_ast.get('type'))
                    fn and fn(self, node_ast)
            except Queue.Empty:
                if(debug): print 'Ready Queue was empty and timed out'
        print "DONE"
        return 0

    def signal(self, wire):
        assert_exists(self, 'signal', wire)
        nodes = self.wireS.get(wire)
        if nodes:
            new = set(nodes).difference(self.ready)
            self.ready = self.ready.union(new)
            for node in new:
                self.ready_q.put(node)

    def wire_set(self, wire, val):
        self.wireV[wire] = val

    def set_and_signal(self, wire, val):
        self.wire_set(wire, val)
        self.signal(wire)

    def wire_get(self, wire):
        assert_exists(self, 'wire_get', wire)
        return self.wireV[wire]

################################################################################

def def_node_config(category, sub_category, node_type,
                    inputs, outputs, other=None):
    if category not in _node_configs:
        _node_configs[category] = {}
    c = _node_configs[category][sub_category] = {}
    c['type'] = node_type
    if inputs:
        if type(inputs) is not list: inputs = [inputs]
        c['inputs'] = inputs
    if outputs:
        if type(outputs) is not list: outputs = [outputs]
        c['outputs'] = outputs
    if other:
        c.update(other)

def gen_node_configs(f='primitiveConfig.js'):
    f = open(f,'w')
    f.write(json.dumps(_node_configs))
    f.close()

def node(name, fields, notes=None):
    def decorator(fn):
        _node_switch_table[name] = fn
    _ast_docs.append({'type': name,
                      'fields':fields,
                      'notes':notes})
    return decorator

def function(name, args, returns=None, notes=None):
    def decorator(fn):
        _func_switch_table[name] = fn
    _func_docs.append({'name': name,
                       'args': args,
                       'returns': returns,
                       'notes': notes})
    def_node_config('call', name, 'call',
                    list(args.keys()),
                    list(returns.keys()) if returns else None,
                    {'name':name})
    return decorator

################################################################################

@node('literal',
      {'val': 'a literal number or string',
       'outputs': 'output wire'})
def _(self, ast):
    val = ast['val']
    if debug: print('literal: {}'.format(val))
    self.set_and_signal(ast['outputs'][0], val)
def_node_config('literal', 'number', 'literal', None,'num',{'value':0})
def_node_config('literal', 'string', 'literal', None,'str',{'value':''})

@node('binop',
      {'op' : 'the operation, +, *, ==, >, ...',
       'inputs[0]': 'a wire for the left hand side input',
       'inputs[1]': 'a wire for the right hand side input',
       'outputs': 'output wire'})
def binop(self, ast):
    left = ast['inputs'][0]
    right = ast['inputs'][1]
    out = ast['outputs'][0]
    op = ast['op']
    if debug:
        print "binop: {}({},{})".format(op, self.wire_get(left), self.wire_get(right))

    if self.wire_get(left) is void or self.wire_get(right) is void:
        print("some node wires not ready yet")
        return
    result = binop_map[op](self.wire_get(left), self.wire_get(right))
    self.set_and_signal(out, result)

cmp_map = {'==': eq, '>': gt, '<': lt,'!=': ne}
math_map = {'+': add, '-': sub, '*' : mul,'/': truediv, "%": mod, "**": pow,
            '&': and_, '|': or_, '>>': rshift, '<<': lshift, '^': xor}
for x in cmp_map:
    def_node_config('comparison', x, 'binop', ['val1', 'val2'], 'result',{'op':x})
for x in math_map:
    def_node_config('math', x, 'binop', ['val1', 'val2'], 'result',{'op':x})

binop_map = cmp_map
binop_map.update(math_map)

@node('if',
      {'cond': 'condition',
       'true': "run when 'cond' is True'",
       'false': "run when 'cond' is False'"})
def _(ast):
    if debug:
        print "if: {} -> {}, {}".format(ast['cond'], ast['true'], ast['false'])
    cond = self.wire_get(ast['cond'])
    true, false = ('true', 'false') if cond else ('false', 'true')
    self.wire_set(ast[false], False)
    self.set_and_signal(ast[true], cond)
def_node_config('comparison', 'if', 'if', 'value', ['true', 'false'])

#should the true and false wires from an if just be used for signaling
#or should they also carry value?

@node('call',
      {'name': 'name of built-in procedure to call',
       'inputs': 'the parameters - a list of input wires',
       'outputs': 'list of output wires for return values (only 1 currently)'})
def _(self, ast):
    if debug: print "call: {}{}".format(ast['name'], str(ast['inputs'][0]))
    fn = _func_switch_table[ast['name']]
    if not fn:
        error("call -- procedure '{}' was not found".format(ast['name']))
    ret = fn(*[self, ast]+[self.wire_get(x) for x in ast['inputs']])
    out = ast.get('outputs')
    if out:
        self.set_and_signal(out[0], ret)#for now, only 1 output

################################################################################
# smap related things

next_id = 0;
class Subscription(WebSocketClient):
    def __init__(self, url, select, cb):
        global next_id
        super(Subscription, self).__init__(url)
        self.select = select
        self.cb = cb
        self.ID = next_id
        next_id += 1;

    def opened(self):
        self.send(self.select)

    def closed(self, code, reason=None):
        print "Closed down", code, reason

    def received_message(self, m):
        self.cb(m)


def smap_subscribe(url, uuid, cb):
    try:
        ws = Subscription(url, "uuid = '{}'".format(uuid), cb)
        print "WS=======>", ws
        ws.connect()
        ws.run_forever()
    except KeyboardInterrupt:
        ws.close()

def new_subscription(self_, url, uuid, output_wires):
    def cb(m):
        for out in output_wires:
            self_.set_and_signal(out, load_json(m.data).get('Readings')[0][1])

    tid = thread.start_new_thread(smap_subscribe, (url, uuid, cb))
    self_.smap_threads.append(tid)
    print "smap: new_subscription('{}',  '{}')".format(url, uuid)

def smap_actuate(uuid, reading, q_url, a_url):
    q_url = q_url or smap_query_url
    a_url = a_url or smap_actuation_url
    #query the acutation stream for 'Properties'
    try:
        r = "select * where uuid = '{}'".format(uuid)
        resp = requests.post(q_url, r)
        j = load_json(resp.text)
        properties = j[0].get('Properties', {})
    except Exception as e:
        print "Error: smap_actuate --failed to extract 'propereties'"
        print e
        exit(1)

    #uuid of our stream
    #TODO: should we have a unique one for each thread?
    act_stream_uuid = "52edbddd-98e9-5cef-8cc9-9ddee810cd88"

    #construct our actuation request
    act = {'/actuate': {'uuid': act_stream_uuid,
                        'Readings': [[int(time.time()), reading]],
                        'Properties': properties,
                        'Metadata':{'override': uuid}}}

    print "sending smap actuation..."
    print requests.post(a_url, data=json.dumps(act))
#    print "sleeping for 3s"
#    time.sleep(3)


@node('smap',
      {'smap-type': 'subscribe, query, actuate',
       'url': '',
       'uuid': '',
       'inputs': 'input for smap actuation',
       'outputs': 'list of output wires'})
def _(self, ast):
    global smap_subscriptions_p
    stype = ast['smap-type']
    if stype == 'subscribe':
        new_subscription(self, ast['url'], ast['uuid'], ast['outputs'])
        self.smap_subscriptions_p = True
    elif stype == 'query':
        pass
    elif stype == 'actuate':
        smap_actuate(ast['uuid'],
                     self.wire_get(ast['inputs'][0]),
                     ast.get('query_url'),
                     ast.get('actuate_url'))

    else:
        print "invalid smap type"


################################################################################
@function('print',
          {'input': 'a value to print'})
def _(self, ast, input):
    print(input)
    return input

@function('even?',
          {'input': 'a number N'},
          {'output': '1if N is even, else 0'})
def _(self,ast,n):
    #print "EVEN?({})".format(n)
    if n is void: return
    if int(n) % 2:
        return 1
    return 0

@function('toggle',
          {'input': 'something'},
          {'output': 'alternate 1, 0'})
def _(self, ast, v):
    if not ast.get('toggle_last'):
        ast['toggle_last'] = 0
    last = ast['toggle_last']
    this = 1 if v else 0
    if last != this:
        ast['toggle_last'] = 1-last
    return ast['toggle_last']

@function('not',
          {'input': 'a binary value'},
          {'output': 'the inverse of the input value'})
def _(_, n):
    #print "EVEN?({})".format(n)
    if n:
        return 0
    return 1

################################################################################

def subscribe(self, wire, node):
    s = self.wireS[wire]
    if not s:
        self.wireS[wire] = s = []
    s.append(node)

def set_ready(self,node_id):
    if node_id not in ready:
        self.ready.add(node_id)
        self.ready_q.put(node_id)

def assert_exists(self,fn, wire):
    if wire not in self.wireV:
        error("{} -- var '{}' not found".format(fn, wire))

def gen_doc():
    print "TODO"

def error(msg):
    print "Error: {}".format(msg)
    exit(1)

if __name__ == '__main__':
    if len(argv) != 2:
        print('Usage:')
        print('  ./interpreter.py <filename>')
        exit(1)
    x = argv[1]
    if x == 'gen:prim':
        gen_node_configs()
        exit(0)
    elif x == 'gen:doc':
        gen_doc()
        exit(0)
    try:
        f = open(x, 'r')
    except IOError:
        print('Error: where is "{}"?'.format(filename))
        exit(1)
    json = load_json(f.read());
    program = Interpreter();
    program.run(json)
