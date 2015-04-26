#!/usr/bin/env python

from operator import *
from sys import argv
from util import *
import json

debug = False
class void:
    def __repr__(self):
        return "<void>"

void = void()

nodes = {}
wireV = {} # wire values
wireS = {} # wire subscriptions
ready_q = []
ready = set()
_ast_docs = []
_func_docs = []
_node_switch_table = {}
_func_switch_table = {}
_node_configs = {} #maps categories to lists of member nodes

def def_node_config(category, sub_category, node_type, inputs, outputs, other=None):
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
    def_node_config('call', name, 'call', args, returns, {'name':name})
    return decorator

@node('program',
      {'initial': 'list of node IDs that must be executed first',
       # or should this be a uuid? or should this be generated by the interpreter?
       'id': 'a unique id used to reference this running process',
       'wires': 'a list of all wire names',
       'connections': 'a dict mapping wires to list of receiving nodes',
       'nodes' :'a dict mapping IDs to nodes'})
def _(ast):
    run_program(ast)
def run_program(ast):
    global nodes, wireV, wireS, ready, ready_q
    nodes = ast['nodes']
    wireS = ast['connections']
    wireV = {str(name) : void for name in range(len(wireS))}
    ready_q = ast.get('initial',[])
    ready = set(ready_q)
    while ready_q:
        node = ready_q.pop(0)
        ready.remove(node)
        run_id(node)

@node('literal',
      {'val': 'a literal number or string',
       'outputs': 'output wire'})
def _(ast):
    val = ast['val']
    if debug: print('literal: {}'.format(val))
    set_and_signal(ast['outputs'][0], val)
def_node_config('literal', 'number', 'literal', 'outputVal','num',{'value':True})
def_node_config('literal', 'string', 'literal', 'outputVal','str',{'value':True})

@node('binop',
      {'op' : 'the operation, +, *, ==, >, ...',
       'inputs[0]': 'a wire for the left hand side input',
       'inputs[1]': 'a wire for the right hand side input',
       'outputs': 'output wire'})
def binop(ast):
    left = ast['inputs'][0]
    right = ast['inputs'][1]
    out = ast['outputs'][0]
    op = ast['op']
    if debug:
        print "binop: {}({},{})".format(op, wire_get(left), wire_get(right))

    if wire_get(left) is void or wire_get(right) is void:
        print("some node wires not ready yet")
        return
    result = binop_map[op](wire_get(left), wire_get(right))
    set_and_signal(out, result)

cmp_map = {'==': eq, '>': gt, '<': lt,'!=': ne}
math_map = {'+': add, '-': sub, '*' : mul,'/': truediv}
for x in cmp_map:
    def_node_config('comparison', x, x, ['threshold', 'value'], 'result')
for x in math_map:
    def_node_config('math', x, x, ['threshold', 'value'], 'result')

binop_map = cmp_map
binop_map.update(math_map)

@node('if',
      {'cond': 'condition',
       'true': "run when 'cond' is True'",
       'false': "run when 'cond' is False'"})
def _(ast):
    if debug:
        print "if: {} -> {}, {}".format(ast['cond'], ast['true'], ast['false'])
    cond = wire_get(ast['cond'])
    true, false = ('true', 'false') if cond else ('false', 'true')
    wire_set(ast[false], False)
    set_and_signal(ast[true], cond)
def_node_config('comparison', 'if', 'if', 'value', ['true', 'false'])

#should the true and false wires from an if just be used for signaling
#or should they also carry value?

@node('call',
      {'name': 'name of built-in procedure to call',
       'inputs': 'the parameters - a list of input wires',
       'outputs': 'list of output wires for return values (only 1 currently)'})
def _(ast):
    if debug: print "call: {}{}".format(ast['name'], str(ast['inputs'][0]))
    fn = _func_switch_table[ast['name']]
    if not fn:
        error("call -- procedure '{}' was not found".format(ast['name']))
    ret = fn(*[wire_get(x) for x in ast['inputs']])
    out = ast.get('outputs')
    if out:
        set_and_signal(out[0], ret)#for now, only 1 output


################################################################################
@function('print',
          {'inputs': 'a value to print'})
def _(input):
    print(input)
    return input

################################################################################

def run(ast):
    fn = _node_switch_table.get(ast.get('type'))
    if fn:
        fn(ast)
    else:
        print "Error: unknown node {}".format(ast)

def run_id(x):
    #print "nodes = {}".format(nodes)
    node = nodes.get(x)
    return node and run(node)


def subscribe(wire, node):
    s = wireS[wire]
    if not s:
        wireS[wire] = s = []
    s.append(node)

def signal(wire):
    global ready
    assert_exists('signal', wire)
    nodes = wireS.get(wire)
    if nodes:
        new = set(nodes).difference(ready)
        ready = ready.union(new)
        ready_q.extend(list(new))

def wire_set(wire, val):
    wireV[wire] = val

def set_and_signal(wire, val):
    wire_set(wire, val)
    signal(wire)

def wire_get(wire):
    assert_exists('wire_get', wire)
    return wireV[wire]

def set_ready(node_id):
    if node_id not in ready:
        ready.add(node_id)
        ready_q.append(node_id)

def assert_exists(fn, wire):
    if wire not in wireV:
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
    run_program(json)
