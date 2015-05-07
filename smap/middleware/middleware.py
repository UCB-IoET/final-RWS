#this is the middleware for the ambiant and IR temperature source
import os
import socket
import msgpack
import uuid
import time
import requests
import json

firestorm_addr = '3039';

# This is what we are listening on for messages
UDP_IP = "::" #all IPs
UDP_PORT = 8099

# Note we are creating an INET6 (IPv6) socket
sock = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)

sock.bind((UDP_IP, UDP_PORT))

# These are the different timeseries paths that our middleware is publishing to
ts_paths = ['ambient_temp','ir_temp']

# Create a new node
def new_node(nodeid):
    md = {}
    for path in ts_paths:
        md['/'+nodeid+'/'+path] = {'uuid': str(uuid.uuid1()), 'Metadata': {'SourceName': 'temperature'}, 'Properties': {'UnitofTime': 'ms', 'UnitofMeasure': 'count'}}
    return md

# We don't want to generate new uuids on every run, just the first
if os.path.exists('.smapmiddleware'):
    addresses = json.load(open('.smapmiddleware'))
else:
    addresses = {}
    addresses[firestorm_addr] = new_node(firestorm_addr)
    json.dump(addresses, open('.smapmiddleware','wb'))

while True: # serve forever
    data, addr = sock.recvfrom(1024)# buffer size is 1024 bytes
    print "data==>", data
    print "addr==>", addr
    if addr[0][-4:] not in addresses:
        continue
    msg = msgpack.unpackb(data)
    print "msg==> ", msg
    smap = addresses[addr[0][-4:]]
    print smap
    for key,val in zip(ts_paths, msg):
        print key
        smap['/'+addr[0][-4:]+'/'+key]['Readings'] = [[int(time.time()*1000), val]]
    try:
        # We use the IPv4 address because requests sometimes defaults to ipv6 if you use DNS and
        # the archiver doesn't support that. This is a hack
        x = requests.post('http://54.215.11.207:8079/add/xyz', data=json.dumps(smap))
        #x = requests.post('http://pantry.cs.berkeley.edu:8079/add/xyz', data=json.dumps(smap))
        print "archiver response ==> ", x
    except Exception as e:
        print e
