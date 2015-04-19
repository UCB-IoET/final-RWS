import os
import socket
#import msgpack
import uuid
import time
import requests
import json
from util import *
from interpreter import run_program
import thread

# read: https://docs.python.org/2/howto/sockets.html
# read2: http://www.binarytides.com/python-socket-server-code-example/

'''
import socket
import sys
from thread import *
 
HOST = ''   # Symbolic name meaning all available interfaces
PORT = 8888 # Arbitrary non-privileged port
 
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
print 'Socket created'
 
#Bind socket to local host and port
try:
    s.bind((HOST, PORT))
except socket.error as msg:
    print 'Bind failed. Error Code : ' + str(msg[0]) + ' Message ' + msg[1]
    sys.exit()
     
print 'Socket bind complete'
 
#Start listening on socket
s.listen(10)
print 'Socket now listening'
 
#Function for handling connections. This will be used to create threads
def clientthread(conn):
    #Sending message to connected client
    conn.send('Welcome to the server. Type something and hit enter\n') #send only takes string
     
    #infinite loop so that function do not terminate and thread do not end.
    while True:
         
        #Receiving from client
        data = conn.recv(1024)
        reply = 'OK...' + data
        if not data: 
            break
     
        conn.sendall(reply)
     
    #came out of loop
    conn.close()
 
#now keep talking with the client
while 1:
    #wait to accept a connection - blocking call
    conn, addr = s.accept()
    print 'Connected with ' + addr[0] + ':' + str(addr[1])
     
    #start new thread takes 1st argument as a function name to be run, second is the tuple of arguments to the function.
    start_new_thread(clientthread ,(conn,))
 
s.close()

'''

'''
USE_MSGPACK = False #otherwise use json
# => would we ever need this?

# This is what we are listening on for messages
UDP_IP = "::" #all IPs
UDP_PORT = 1263

buffer_size = 1024

# Note we are creating an INET6 (IPv6) socket
sock = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)

sock.bind((UDP_IP, UDP_PORT))
'''

#Function for handling connections. This will be used to create threads
def clientthread(conn, msg):
        print("thread run")
        conn.send('Welcome to the server.')
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

HOST = ''   # Symbolic name meaning all available interfaces
PORT = 1263 # Arbitrary non-privileged port
buffer_size = 1024
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
print 'Socket created'


#Bind socket to local host and port
try:
    sock.bind((HOST, PORT))
    print 'socket bound'
except socket.error as msg:
    print 'Bind failed. Error Code : ' + str(msg[0]) + ' Message ' + msg[1]
    sys.exit()
     
print 'Socket bind complete'
 
#Start listening on socket
sock.listen(10)
print 'Socket now listening'


 

#note nested in While True - may change up this structure 
while 1:
    #wait to accept a connection - blocking call
    conn, addr = sock.accept()
    print 'Connected with ' + addr[0] + ':' + str(addr[1])
    
    data, addr = sock.recvfrom(buffer_size)
    msg = data 
    #start new thread takes 1st argument as a function name to be run, second is the tuple of arguments to the function.
    thread.start_new_thread(clientthread ,(conn, msg))
 
s.close()







