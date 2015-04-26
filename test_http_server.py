import json
import urllib2 

PORT='1445'

program = {'type':'program',
           'uid': 'rws',
           'password': 'password',
           'pid':'1',
           #a list of the nodes that are ready to run.
           #These are the nodes that don't have a parent.
           'initial': ['n0', 'n1'],
           #'connections' maps wires to lists of nodes that are connected to them
           'connections':{'w0' : ['n2'],
                          'w1' : ['n2'],
                          'w2' : ['n3']},
           #the total number of wires. I think this may not be necessary
           'nwires' : 3,
           #mapping of node IDs to nodes
           # each node must have a 'type' field.
           # some other node fields:
           #    'out': the id of the nodes output wire, if any
           #           we currently only support 1 output
           #     'in': a list of the nodes input wires, if any
           'nodes':{'n0' : {'type': 'literal',
                            'val': 4,
                            'outputs': ['w0']},
                    'n1' : {'type': 'literal',
                            'val': 8,
                            'outputs': ['w1']},
                    'n2' : {'type': 'binop',
                            'op': '+',
                            'inputs':['w0', 'w1'],
                            'outputs': ['w2']},
                    'n3' : {'type': 'call',
                            'name': 'print',
                            'inputs': ['w2']}}}


req = urllib2.Request('http://10.142.34.191:'+PORT)
req = urllib2.Request('http://127.0.0.1:'+PORT)

req.add_header('Content-Type', 'application/json')

response = urllib2.urlopen(req, json.dumps(program))

print(response)
