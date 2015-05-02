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

PORT = 1471

def client_thread(program, addr, n_threads):
    #stream some data to the archiver
    #we have the child do this so the parent can remain responsive
    update_thread_stream(n_threads)
    program['status'] = 'running'
    if(run_program(program) == 0): #success
        program['status'] = 'completed'
    else:
        program['status'] = 'terminated'


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


class ProgramCache:
    programs = {}

    def __init__(self, use_file):
        if(use_file and os.path.isfile('programDump.json')):
            f = open('programDump.json', 'r')
            self.programs = json.load(f)
            f.close()

    def store_program(self, program):
        if not str(program['uid']) in self.programs:
            self.programs[str(program['uid'])] = {}

        self.programs.get(str(program['uid']))[str(program['pid'])] = program
        program['status'] = 'Not Started'
        self.dump_to_file()

    def get_program(self, uid, pid):
        # print 'looking for ({}, {}) in {}'.format(uid, pid, self.programs)
        return self.programs.get(str(uid)).get(str(pid))

    def list_programs(self, uid):
        if(str(uid) in self.programs):
            return self.programs.get(str(uid)).keys()
        return [];

    def dump_to_file(self):
        f = open('programDump.json', 'w')
        json.dump(self.programs,f, indent=2)
        f.close()

class ServerHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    cache = ProgramCache(True)
    def extract_ids(self):
        length = int(self.headers['Content-length'])
        post_content = self.rfile.read(length)
        try:
            info = util.load_json(post_content)
        except:
            print "Error extracting json"
            self.send_response(500)
            return
        if not (info.get('uid') and info.get('pid') and info.get('password')):
            print("Invalid user/program id, ignoring.")
            return
        if str(info['password']) != "password":
            print("Authentication failed")
            self.send_response(500)
            return
        uid, pid = info['uid'], info['pid']
        return uid, pid

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
        if(self.path == '/new'):
            # load post content
            length = int(self.headers['Content-length'])
            post_content = self.rfile.read(length)

            # object is a dictionary
            try:
                program = util.load_json(post_content)
            except:
                print "Error extracting json"
                self.send_response(500)
                return

            #check that received json is a valid program
            if not all([program.get(x) for x in ['password',
                                                 'uid',
                                                 'pid',
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
                self.send_response(500)
                return

            self.cache.store_program(program)
            self.send_response(200)
            self.end_headers()
            self.wfile.write('Successfully stored program: ({},{})'.format(program['uid'],program['pid']));

        elif (self.path == '/start'): #TODO: Authentication of start request
            uid, pid = self.extract_ids()
            program = self.cache.get_program(uid, pid)
            if program:
                print "Starting process for program: ({},{})".format(uid, pid)
                # feed client address into threadable function
                client_addr = str(self.client_address[0]) + ":" + str(self.client_address[1])
                n_threads += 1
                tid = thread.start_new_thread(client_thread,
                                      (program, client_addr, n_threads))
                program['tid'] = tid;
                self.send_response(200)
                self.end_headers()
                self.wfile.write('Successfully started program: ({},{})'.format(program['uid'],program['pid']));
            else:
                print "No such program: ({}, {})".format(uid, pid)
                self.send_response(500)
        elif (self.path == '/stop'): # not actually doing anything atm...need to make threads killable
            uid, pid = self.extract_ids()
            program = self.cache.get_program(uid, pid)
            if program:
                print "Stopping process for program: ", uid
                # n_threads -= 1
                # tid = thread.start_new_thread(client_thread,
                #                       (program, client_addr, n_threads))
                # program['tid'] = tid;
                self.send_response(200)
                self.end_headers()
                self.wfile.write('Successfully stopped program: ({},{})'.format(program['uid'],program['pid']));
            else:
                print "No such program: ", uid
                self.send_response(500)
        elif(self.path == '/status'): #get the status of a specific program
            uid, pid = self.extract_ids()
            program = self.cache.get_program(uid, pid)
            if program:
                print "status", program['status']
                self.send_response(200)
                self.end_headers()
                self.wfile.write(program['status']);
            else:
                print "No such program: ", uid
                self.send_response(500)
        elif(self.path == '/list_programs'): #list program uids for a given user
            length = int(self.headers['Content-length'])
            post_content = self.rfile.read(length)
            try:
                info = util.load_json(post_content)
            except:
                print "Error extracting json"
                self.send_response(500)
                return
            if not (info.get('uid')  and info.get('password')):
                print("Invalid user id, ignoring.")
                return
            if str(info['password']) != "password":
                print("Authentication failed")
                self.send_response(500)
                return
            uid = info['uid']
            self.send_response(200)
            self.end_headers()
            self.wfile.write(json.dumps(self.cache.list_programs(uid)))
        else:
            print("Invalid path")
            self.send_response(404)
        #TODO: save this thread id in the users thread list



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
httpd.allow_reuse_address = True # Prevent 'cannot bind to address' errors on restart....not working atm
print("Server active")
httpd.serve_forever()
