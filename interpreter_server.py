import os
import socket
#import msgpack
import uuid
import time
import requests
import json
from util import *
from interpreter import run_program

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

while True:
    data, addr = sock.recvfrom(buffer_size)
    if USE_MSGPACK:
        msg = msgpack.unpackb(data)
    else:
        msg = load_json(data)
    print "RECEIVED>>>", msg
    print "FROM>>>", addr

    if str(msg.get('password')) != "password":
        print("Authentication failed")
        continue

    if not all([msg.get(x) for x in ['initial', 'connections', 'nodes']]):
        print("Invalid program, ignoring.")
        print("msg = ",msg)
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

    run_program(msg)
