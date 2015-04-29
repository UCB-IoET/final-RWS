#!/usr/bin/env python
import SimpleHTTPServer
import SocketServer
import logging
import util
import thread
import uuid
import os
import time
import requests
import json
from interpreter import run_program
from interpreter import _node_configs

PORT = 1458

def client_thread(program, addr, n_threads):
    #stream some data to the archiver
    #we have the child do this so the parent can remain responsive
    update_thread_stream(n_threads)

    run_program(program)


def update_thread_stream(n_threads):
    smap = {}
    processes = smap['/processes3'] = addresses['/processes3']
    processes['Readings'] = [[int(time.time()*1000), n_threads]]
    try:
        # We use the IPv4 address because requests sometimes defaults
        # to ipv6 if you use DNS and the archiver doesn't support that.
        # This is a hack

        print "sending this to archiver: ", json.dumps(smap)
        x = requests.post('http://54.215.11.207:8079/add/interpreter',
        #x = requests.post('http://shell.storm.pm:8079/add/interpreter',
        #x = requests.post('http://pantry.cs.berkeley.edu:8079/add/xyz',
                          data=json.dumps(smap))
        print "archiver response: ", x
    except Exception as e:
        print (e)

class ServerHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):
        if(self.path == '/config'):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.request.sendall(json.dumps(_node_configs))

    def do_POST(self):
        global n_threads
        logging.warning("======= POST STARTED =======")
        logging.warning(self.headers)

        # load post content
        length = int(self.headers['Content-length'])
        post_content = self.rfile.read(length)

        # object is a dictionary
        program = util.load_json(post_content)

        # feed client address into threadable function
        client_addr = str(self.client_address[0]) + ":" + str(self.client_address[1])

        #check that received json is a valid program
        if not all([program.get(x) for x in ['password',
                                             # 'uid',
                                             # 'pid',
                                             'initial',
                                             'connections',
                                             'nodes',
                                             'type']]):
            print("Invalid program, ignoring.")  
            return

        #check user id and password
        #TODO: user IDs
        if str(program['password']) != "password":
            print("Authentication failed")
            return

        n_threads += 1
        tid = thread.start_new_thread(client_thread,
                                      (program, client_addr, n_threads))
        #TODO: save this thread id in the users thread list

        self.send_response(200)


################################################################################
#initialize smap stuff
n_threads = 0
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

################################################################################

httpd = SocketServer.TCPServer(("127.0.0.1", PORT), ServerHandler)

print("Server active")
httpd.serve_forever()
