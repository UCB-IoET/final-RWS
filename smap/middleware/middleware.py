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
UDP_PORT = 8199

# Note we are creating an INET6 (IPv6) socket
sock = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)

sock.bind((UDP_IP, UDP_PORT))

# We don't want to generate new uuids on every run, just the first
if os.path.exists('.smapmiddleware2'):
    addresses = json.load(open('.smapmiddleware2'))
    print addresses
else:

    addresses = {}
    addresses['ambient_temp'] = {'uuid': str(uuid.uuid1()),
                                 'Metadata': {'SourceName': 'RWS_ambient_temp',
                                              "Location": {"City": "Berkeley"}},

                                 'Properties': {'UnitofTime': 'ms',
                                                "Timezone": "America/Los_Angeles",
                                                "ReadingType": "double",
                                                "StreamType": "numeric",
                                                'UnitofMeasure': 'count'}}
    addresses['ir_temp'] = {'uuid': str(uuid.uuid1()),
                            'Metadata': {'SourceName': 'RWS_ir_temp',
                                         "Location": {"City": "Berkeley"}},
                            'Properties': {'UnitofTime': 'ms',
                                           "Timezone": "America/Los_Angeles",
                                           "ReadingType": "double",
                                           "StreamType": "numeric",
                                           'UnitofMeasure': 'count'}}
    for name in ['acc_x','acc_y','acc_z']:
        addresses[name] = {'uuid': str(uuid.uuid1()),
                           'Metadata': {'SourceName': 'RWS_'+name},
                           'Properties': {'UnitofTime': 'ms',
                                          "Timezone": "America/Los_Angeles",
                                          "ReadingType": "double",
                                          "StreamType": "numeric",
                                          'UnitofMeasure': 'count'}}
    for i in range(1,4):
        name  = "button_{}".format(i)
        addresses[name] = {'uuid': str(uuid.uuid1()),
                           'Metadata': {'SourceName': 'RWS_'+name},
                           'Properties': {'UnitofTime': 'ms',
                                          "Timezone": "America/Los_Angeles",
                                          "ReadingType": "double",
                                          "StreamType": "numeric",
                                          'UnitofMeasure': 'count'}}

    json.dump(addresses, open('.smapmiddleware2','wb'))

def post(x):
    #print "==============================================="
    #print "sending to archiver: ", x
    #print "==============================================="
    print x
    try:
        # We use the IPv4 address because requests sometimes defaults to ipv6 if you use DNS and
        # the archiver doesn't support that. This is a hack
        x = requests.post('http://54.215.11.207:8079/add/RWS', data=json.dumps(x))
        #x = requests.post('http://pantry.cs.berkeley.edu:8079/add/xyz', data=json.dumps(smap))
        #print "archiver response ==> ", x
    except Exception as e:
        print e

while True: # serve forever
    data, addr = sock.recvfrom(1024)# buffer size is 1024 bytes
    print "data==>", data
    print "addr==>", addr
    if addr[0][-4:] != firestorm_addr:
        continue
    amb, ir, butt, acc  = msgpack.unpackb(data)
    butt = map(lambda x: 1 if x else 0, butt)
    print "ambient temp = ", amb
    print "IR temp = ", ir
    print "buttons = ", butt
    print "accelerometer = ", acc
    names = ['ambient_temp', 'ir_temp','acc_x','acc_y','acc_z', 'button_1', 'button_2', 'button_3']
    values = [amb, ir] + acc + butt
    #names = ['ambient_temp']
    #values = [amb]
    for name, val in zip(names, values):
        smap = {}
        smap['/'+name] = addresses[name]
        addresses[name]['Readings'] = [[int(time.time()*1000), val]]
        post(smap)
