# testing to see if simple thread server works before trying to send post requests by javascript

import requests
import json
import time

import socket

'''
>>> import socket
>>> socket.gethostbyname(socket.gethostname())
'10.142.34.191'
'''


program = {'type':'program',
           'password': 'password',
           'initial': ['0', '1'],
           'connections':{'0' : ['2'],
                          '1' : ['2'],
                          '2' : ['3']},
           'nwires' : 3,
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

IP = "10.142.34.191"
#PORT=8888
BUFFER_SIZE=1024
SPORT=1263

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((IP, SPORT))

resp = s.send(json.dumps(program))

print(resp)

'''
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)


IP = "2607:f140:400:a001:189e:1858:2c10:b972"
IP = "2607:f140:400:a009:189e:1858:2c10:b972"
PORT=8888
BUFFER_SIZE = 1024
UDP_PORT = 1263

s = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)

s.connect((IP, UDP_PORT))

resp = s.send(json.dumps(program))

print(resp)
'''



# [0:4] -0-[2:+]-2-[3:print]
# [1:8] -1-/


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
program2 = {'type':'program',
            'password': 'password',
            'initial': ['0', '1', '4', '6', '8'],
            'nwires': 8,
            'connections':{'0' : ['2'],
                           '1' : ['2'],
                           '2' : ['3'],
                           '3' : ['3'],
                           '5' : ['5'],
                           #'6' : ['5'],
                           '7' : ['7'],
                           #'8' : ['7'],
                           '9' : ['9']},
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
                     '3' : {'type': 'binop',
                            'op' : '<',
                            'left': '2',
                            'right': '3',
                            'out': '9'},
                     '4' : {'type': 'literal',
                            'val': 100,
                            'out': '3'},
                     '5' : {'type': 'call',
                            'name': 'print',
                            'in': ['6']},
                     '6' : {'type': 'literal',
                            'val': 'yes',
                            'out': '6'},
                     '7' : {'type': 'call',
                            'name': 'print',
                            'in': ['8']},
                     '8' : {'type': 'literal',
                            'val': 'no',
                            'out': '8'},
                     '9' : {'type': 'if',
                            'cond': '9',
                            'true': '5',
                            'false':'7'}}}


'''
IP = "2607:f140:400:a001:189e:1858:2c10:b972"
IP = "2607:f140:400:a009:189e:1858:2c10:b972"
PORT=8888
BUFFER_SIZE = 1024
UDP_PORT = 1263

s = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)

s.connect((IP, UDP_PORT))

resp = s.send(json.dumps(program))

print(resp)
'''