import requests
import json
import time

import socket

# [0:4] -0-[2:+]-2-[3:print]
# [1:8] -1-/

program = {'type':'program',
           'password': 'password',
           'initial': ['0', '1'],
           'connections':{'0' : ['2'],
                          '1' : ['2'],
                          '2' : ['3']},
           'nodes':{'0' : {'type': 'literal',
                           'val': 4,
                           'out': '0'},
                    '1' : {'type': 'literal',
                           'val': 8,
                           'out': '1'},
                    '2' : {'type': 'binop',
                           'op': '+',
                           'left': '0',
                           'right': '1',
                           'out': '2'},
                    '3' : {'type': 'call',
                           'name': 'print',
                           'in': ['2']}}}


IP = "2607:f140:400:a001:189e:1858:2c10:b972"
PORT=8888
BUFFER_SIZE = 1024
UDP_PORT = 1263

s = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)

s.connect((IP, UDP_PORT))

resp = s.send(json.dumps(program))

print(resp)
