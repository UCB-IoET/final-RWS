import os
import socket
#import msgpack
import uuid
import time
import requests
import json
from operator import *
from util import *

USE_MSGPACK = False #otherwise use json
# => would we ever need this?

# This is what we are listening on for messages
UDP_IP = "::" #all IPs
UDP_PORT = 1263

buffer_size = 1024


# Note we are creating an INET6 (IPv6) socket
sock = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)

sock.bind((UDP_IP, UDP_PORT))

process_count = 0
md = {}
md['/processes3'] = {'uuid': str(uuid.uuid1()),
                    'Metadata': {'SourceName': 'interpreter3'},
                    'Properties': {'UnitofTime': 'ms', 'UnitofMeasure': 'count'}}

# We don't want to generate new uuids on every run, just the first
if os.path.exists('.smap_interpreter'):
    addresses = json.load(open('.smap_interpreter'))
else:
    addresses = md
    json.dump(addresses, open('.smap_interpreter','wb'))


env = {}

literal_map = {'int': int,
               'float': float,
               'str' :str,
               'list': lambda e: [eval(x, _env) for x in e],
               'dict': lambda e: {}}

def p(x):
    print x
    return x

primitives = {'print': p,
              'put_request': lambda x: requests.put(x),
              'sleep': lambda x: time.sleep(x)}

def lookup(e, name):
    #TODO: fix for false values
    return e.get(name) or (e['__parent'] and lookup(e['__parent'], name))

def bind(e, name, value):
    e[name] = value
    return value

def def_prim(name, fn):
    bind(primitives, name, fn)

_ast_docs = []
_func_docs = []
_node_switch_table = {}
_func_switch_table = {}

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
                       'args':
                       'returns': returns,
                       'notes': notes})
    return decorator

@node('program',
      {'password': 'authorization key for remote interpreter',
       'top': 'list of node IDs that must be executed first',
       '<IDs:nodes>' :'mappings of IDs to nodes'})
def _(ast):
    global env;
    env = program
    list(map(run_id, program.get('top',[])))

@node('literal',
      {'val': 'a literal number or string'}
      {'out': 'output wire'})
def num(ast):
      set_and_signal(ast['out'], ast['n'])

@node('binop',
      {'op' : 'the operation, +, *, ==, >, ...',
       'left': 'a wire for the left hand side input',
       'right': 'a wire for the right hand side input',
       'out': 'output wire'})
def binop(ast):
    result = binop_map[ast['op']](wire_get(ast['left']), wire_get(ast['right']))
    set_and_signal(ast['out'], result)

binop_map = {'+' : add, '-' : sub, '*' : mul,'/' : truediv,
             '==': eq,'>' : gt, '< ': lt,'!=': ne}

@node('if',
      {'cond': 'condition',
       'true': "run when 'cond' is True'",
       'false': "run when 'cond' is False'"})
def _(ast):
    cond = wire_get(ast['cond'])
    signal(ast['true'] if cond else ast['false'])

@node('call',
      {'name': 'name of built-in procedure to call',
       'in': 'the parameters - a list of input wires',
       'out': 'output wire for return value'})
def _(ast):
    fn = _func_switch_table[ast['name']]
    if not fn:
        error("call -- procedure '{}' was not found".format(ast['name']))
    set_and_signal(ast['out'], fn(*[wire_get(x) for x in ast['in']]))

################################################################################
@function('print',
          {'val': 'a value to print'})
def _(val):
    print(val)
    return val

################################################################################
def signal(wire):
    assert_exists('signal', wire)
    x = env[wire]
    x and run(x)

def wire_set(wire, val):
    env[wire] = val

def set_and_signal(wire, val):
    set_wire(wire, val)
    signal(var)

def wire_get(wire):
    assert_exists('wire_get', wire)
    return env[wire]

def assert_exists(fn, wire):
    if wire not in env:
        error("{} -- var '{}' not found".format(fn, var))

def gen_doc():
    print "TODO"

def error(msg):
    print "Error: {}".format(msg)
    exit(1)

################################################################################
#OLD:



def lookup(var):
    if var in env:
        return env[var]
    print "Error: '{}' not found in env".format(var)

def run(ast):
    fn = _node_switch_table(ast['type'])
    if fn:
        fn(ast)
    else:
        print "Error: unknown ast node {}".format(ast)

def run_id(x):
    ast = env.get(x)
    return ast and run(ast)


def evalu(ast, e):
    typ = ast.get('type')
    if not typ:
        print("Error: ast field has no type: " + str(ast))

    if typ == 'lit':
        return literal_map[ast['ltype']](ast.get('val'))
    elif typ == 'binop':
        return binop_map[ast['op']](evalu(ast['left'], e), evalu(ast['right'],e))
    elif typ == 'if':
        return evalu(ast['true'] if evalu(ast['cond'], e) else ast['false'], e)
    elif typ == 'while':
        cond, body = ast['cond'], ast['body']
        ret = None
        while evalu(cond, e): ret = evalu(body, e)
        return ret
    elif typ == 'call':
        fn = lookup(e, ast['name'])
        new = ast['env']
        args = [bind(new,n,evalu(x, e)) for n,x in zip(fn['params'],ast['args'])]
        return [evalu(exp, new) for exp in ast['body']][-1]
    elif typ == 'prim':
        fn = primitives[ast['name']]
        args = [evalu(x, e) for x in ast['args']]
        return fn(*args)
    elif typ == 'def':
        fn = {'params': ast['params'], 'body': ast['body'], 'env': {'__parent':e}}
        bind(e, ast.get('name','lambda'), fn)
        return fn
    elif typ == 'varget':
        return lookup(e, ast['name'])
    elif typ == 'varset':
        return bind(e, ast['name'], evalu(ast['expr'], e))
    elif typ == 'begin':
        return [evalu(exp, e) for exp in ast['exprs']][-1]
    else:
        print("Error: unknown AST node: " + str(ast))

while True:
    data, addr = sock.recvfrom(buffer_size)
    if USE_MSGPACK:
        msg = msgpack.unpackb(data)
    else:
        msg = load_json(data)
    print "RECEIVED>>>", msg
    print "FROM>>>", addr

    if str(msg['key']) != "password":
        print("Authentication failed")
        continue

    ast = msg.get('ast')
    if not ast:
        print("no AST found")
        continue

    smap = {}
    processes = smap['/processes3'] = addresses['/processes3']
    process_count += 1
    processes['Readings'] = [[int(time.time()*1000), process_count]]

    try:
        # We use the IPv4 address because requests sometimes defaults
        # to ipv6 if you use DNS and the archiver doesn't support that.
        # This is a hack

        print "sending this to archiver: ", json.dumps(smap)

        x = requests.post('http://54.215.11.207:8079/add/interpreter',
        #x = requests.post('http://shell.storm.pm:8079/add/interpreter',
                          data=json.dumps(smap))
        #x = requests.post('http://pantry.cs.berkeley.edu:8079/add/xyz',
        #                  data=json.dumps(smap))
        print "archiver: ", x
    except Exception as e:
        print (e)

    print "===> ", evalu(ast, global_env)
