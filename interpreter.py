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
