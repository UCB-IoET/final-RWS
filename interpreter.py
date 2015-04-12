import os
import socket
#import msgpack
import uuid
import time
import requests
import json
from operator import *

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
md['/processes'] = {'uuid': str(uuid.uuid1()),
                    'Metadata': {'SourceName': 'interpreter'},
                    'Properties': {'UnitofTime': 'ms', 'UnitofMeasure': 'count'}}

# We don't want to generate new uuids on every run, just the first
if os.path.exists('.smap_interpreter'):
    addresses = json.load(open('.smap_interpreter'))
else:
    addresses = md
    json.dump(addresses, open('.smap_interpreter','wb'))


global_env = {'__parent':None}

binop_map = {'+' : add, '-' : sub, '*' : mul,'/' : truediv,
             '==': eq,'>' : gt, '< ': lt,'!=': ne}

literal_map = {'int': int,
               'float': float,
               'str' :str,
               'list': lambda e: [eval(x, _env) for x in e],
               'dict': lambda e: {}}

def p(x):
    print x
    return x

primitives = {'print': p}

def lookup(e, name):
    #TODO: fix for false values
    return e.get(name) or (e['__parent'] and lookup(e['__parent'], name))

def bind(e, name, value):
    e[name] = value
    return value

def def_prim(name, fn):
    bind(primitives, name, fn)

################################################################################
#The following two function where taken from:
#  http://stackoverflow.com/questions/956867/how-to-get-string-objects-instead-of-unicode-ones-from-json-in-python
def _decode_list(data):
    rv = []
    for item in data:
        if isinstance(item, unicode):
            item = item.encode('utf-8')
        elif isinstance(item, list):
            item = _decode_list(item)
        elif isinstance(item, dict):
            item = _decode_dict(item)
        rv.append(item)
    return rv
def _decode_dict(data):
    rv = {}
    for key, value in data.iteritems():
        if isinstance(key, unicode):
            key = key.encode('utf-8')
        if isinstance(value, unicode):
            value = value.encode('utf-8')
        elif isinstance(value, list):
            value = _decode_list(value)
        elif isinstance(value, dict):
            value = _decode_dict(value)
        rv[key] = value
    return rv
################################################################################
def load_json(s):
    return json.loads(s, object_hook=_decode_dict)


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
    processes = smap['/processes'] = md['/processes']
    process_count += 1
    processes['Readings'] = [[int(time.time()*1000), process_count]]

    try:
        # We use the IPv4 address because requests sometimes defaults
        # to ipv6 if you use DNS and the archiver doesn't support that.
        # This is a hack
        print "sending this to archiver: ", json.dumps(smap)
        x = requests.post('http://54.215.11.207:8079/add/interpreter',
                          data=json.dumps(smap))
        #x = requests.post('http://pantry.cs.berkeley.edu:8079/add/xyz',
        #                  data=json.dumps(smap))
        print "archiver: ", x
    except Exception as e:
        print (e)

    print "===> ", evalu(ast, global_env)
