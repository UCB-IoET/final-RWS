import requests
import json
import time

import socket

def make_ast(n):
    return {'type':'prim',
            'name':'print',
            'args':[{'type': 'binop',
                     'op': '+',
                     'left': {'type': 'lit', 'ltype': 'int', 'val': n},
                     'right': {'type': 'lit', 'ltype': 'int', 'val': n*n}}]}

#IP_6 = "fe80::201:c0ff:fe15:8419"
IP = "2001:470:4956:1::1" #from ifconfig -> eth1
IP = "2607:f140:400:a009:2c5b:3fd4:a97a:7e3a" #michaels laptop

PORT=8888
BUFFER_SIZE = 1024
UDP_PORT = 1263

s = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)
#s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

#s.connect((IP, PORT))
s.connect((IP, UDP_PORT))
i = 0
while True:
    i += 1
    data = {"key":"password",
            "ast" : make_ast(i)}
    resp = s.send(json.dumps(data))
    print(">>> " + str(resp))
    time.sleep(2)


"""
source:
  http://proj.storm.pm:8081/data/

archiver:
  http://shell.storm.pm:8079/api/query

"""


