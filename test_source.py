import requests
import json
import time

import socket

#nodes are represented with brackets in the form
#  [<NODE_ID>:...] and wires in the form -WIRE_ID-
#
# Equivalent of the program "print(4+8)":
#
# [0:4] -0-[2:+]-2-[3:print]
# [1:8] -1-/

program = {
    "type": "program",
    "password": "password",
    "initial": [
        "1"
    ],
    "connections": {
        "0": "2"
    },
    "nodes": {
        "1": {
            "inputs": [],
            "outputs": [
                "0"
            ],
            "type": "literal",
            "name": "literal",
            "val": 5
        },
        "2": {
            "inputs": [
                "0"
            ],
            "outputs": [],
            "type": "call",
            "name": "print"
        }
    }
}
#if (4 + 8 > 3):
#  print("yes")
#else:
#  print("no")
#
#
# [0:4] -0-[2:+]-2-[3:>]-9-[9:if]---5-----*[5:print]
# [1:8] -1-/       /             \             /
#                 3               \  [6:"yes"]/6
#                /                 \
#               /                   \-7----*[7:print]
#           [4:100]                         /
#                                  [8:"no"]/8
#
# A node should fire everytime one of its outputs changes
# but only when all of its outputs have been set at least once.
# Example above: '>' will be called before '+' is done

#
# should > always output a value, even when it is false?
# if yes, we need 'if'
# if no, we could remove 'if' but then
# we need a false output of the condition
# OR: we could
# =>NO explicit if
#     -but then how should would you do print(a==b)?

program2 = {'type':'program',
            'password': 'password',
            'initial': ['n0', 'n1', 'n4', 'n6', 'n8'],
            'nwires': 8,
            'connections':{'w0' : ['n2'],
                           'w1' : ['n2'],
                           'w2' : ['n3'],
                           'w3' : ['n3'],
                           'w5' : ['n5'],
                           #'w6' : ['n5'],
                           'w7' : ['n7'],
                           #'w8' : ['n7'],
                           'w9' : ['n9']},
            'nodes':{'w0' : {'type': 'literal',
                            'val': 4,
                            'out': 'w0'},
                     'w1' : {'type': 'literal',
                            'val': 8,
                            'out': 'w1'},
                     'w2' : {'type': 'binop',
                            'op': '+',
                            'left': 'w0',
                            'right': 'w1',
                            'out': '2'},
                     'w3' : {'type': 'binop',
                            'op' : '<',
                            'left': 'w2',
                            'right': 'w3',
                            'out': 'w9'},
                     'w4' : {'type': 'literal',
                            'val': 100,
                            'out': 'w3'},
                     'w5' : {'type': 'call',
                            'name': 'print',
                            'in': ['w6']},
                     'w6' : {'type': 'literal',
                            'val': 'yes',
                            'out': 'w6'},
                     'w7' : {'type': 'call',
                            'name': 'print',
                            'in': ['w8']},
                     'w8' : {'type': 'literal',
                            'val': 'no',
                            'out': 'w8'},
                     'w9' : {'type': 'if',
                            'cond': 'w9',
                            'true': 'w5',
                            'false':'w7'}}}


IP = "2607:f140:400:a009:6c33:67a1:427b:7cb8"
     
PORT=8888
BUFFER_SIZE = 1024
UDP_PORT = 1263

s = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)

s.connect((IP, UDP_PORT))

resp = s.send(json.dumps(program))

print(resp)
