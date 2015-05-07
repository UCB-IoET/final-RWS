#!/usr/bin/env python
PORT = 14588

print_errors = True
print_responses = True

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
from interpreter import Interpreter
from interpreter import _node_configs

def client_thread(program, addr, n_threads):
    #stream some data to the archiver
    #we have the child do this so the parent can remain responsive
    update_thread_stream(n_threads)
    program['status'] = 'running'
    interpreter = Interpreter()
    if (interpreter.run(program) == 0): #success
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
            for uid in self.programs:
                for pid in self.programs[uid]:
                    self.programs[uid][pid]['status'] = 'Not Started'
            f.close()
            self.dump_to_file()

    def store_program(self, program):
	if not str(program['uid']) in self.programs:
            self.programs[str(program['uid'])] = {}
        self.programs[str(program['uid'])][str(program['pid'])] = program
        program['status'] = 'Not Started'
        self.dump_to_file()

    def get_program(self, uid, pid):
        # print 'looking for ({}, {}) in {}'.format(uid, pid, self.programs)
        if self.programs.get(str(uid)):
            return self.programs.get(str(uid)).get(str(pid))
        return None

    def remove_program(self, uid, pid):
        del self.programs.get(str(uid))[str(pid)]
        if(len(self.programs.get(str(uid))) == 0):
            del self.programs[str(uid)]
        self.dump_to_file()


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
    def do_error(self, error):
        if(print_errors):
            print(error)
        self.send_response(500)
        self.end_headers()
        self.wfile.write(error)
        return
    
    def do_response(self, message):
        if(print_responses):
            print(message)
        self.send_response(200)
        self.end_headers()
        self.wfile.write(message)
        return

    def extract_ids(self):
        length = int(self.headers['Content-length'])
        post_content = self.rfile.read(length)
        try:
            info = util.load_json(post_content)
        except:
            return self.do_error("Error extracting json")
        if not (info.get('uid') and info.get('pid') and info.get('password')):
            return self.do_error("Invalid program metadata")
        if str(info['password']) != "password":
           return self.do_error("Authentication Failed")
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
        # logging.warning("======= POST STARTED =======")
        # logging.warning(self.headers)
        if(self.path == '/new'):
            # load post content
            length = int(self.headers['Content-length'])
            post_content = self.rfile.read(length)

            # object is a dictionary
            try:
                program = util.load_json(post_content)
            except:
               return self.do_error("Error extracting json")

            #check that received json is a valid program
            if not all([program.get(x) for x in ['password',
                                                 'uid',
                                                 'pid',
                                                 'initial',
                                                 'connections',
                                                 'nodes',
                                                 'type']]):
                print("Invalid program, ignoring: {}", program)
                return

            existing = self.cache.get_program(program['uid'], program['pid'])
            if existing: #terminate the running process before overwriting
                n_threads -= 1
                existing['shouldStop'] = True

            self.cache.store_program(program)

            self.do_response('Successfully stored program: ({},{})'.format(program['uid'],program['pid']))
        elif (self.path == '/start'): #TODO: Authentication of start request
            try:
                uid, pid = self.extract_ids()
            except:
                return self.do_error('Invalid Program Metadata')
            program = self.cache.get_program(uid, pid)
            if program:
                if program['status'] != 'running':
                    # feed client address into threadable function
                    client_addr = str(self.client_address[0]) + ":" + str(self.client_address[1])
                    n_threads += 1
                    program['shouldStop'] = False

                    tid = thread.start_new_thread(client_thread,
                                          (program, client_addr, n_threads))
                    program['tid'] = tid;
                    self.do_response('Successfully started program: ({},{})'.format(program['uid'],program['pid']))
                else:
                    return self.do_error("Program already running: ({}, {})".format(uid, pid))
            else:
                return self.do_error("No such program: ({},{})".format(uid, pid))
        elif (self.path == '/stop'): # not actually doing anything atm...need to make threads killable
            try:
                uid, pid = self.extract_ids()
            except:
                return self.do_error("Invalid Program Metadata");
            program = self.cache.get_program(uid, pid)
            if program:
                n_threads -= 1
                program['shouldStop'] = True
                self.do_response('Successfully stopped program: ({},{})'.format(program['uid'],program['pid']))
            else:
                return self.do_error("No such program: ({},{})".format(uid, pid))
        elif(self.path == '/status'): #get the status of a specific program
            uid, pid = self.extract_ids()
            program = self.cache.get_program(uid, pid)
            if program:
                if(print_responses):
                    print("For Program: ({},{})".format(program['uid'],program['pid']))
                self.do_response(program['status']);
            else:
                return self.do_error("No such program: ({},{})".format(uid, pid))
        elif(self.path == '/delete'): #get the status of a specific program
            uid, pid = self.extract_ids()
            program = self.cache.get_program(uid, pid)
            if program:
                self.cache.remove_program(uid, pid)
                self.do_response('Successfully deleted program: ({},{})'.format(program['uid'],program['pid']));
            else:
                return self.do_error("No such program: ({},{})".format(uid, pid))
        elif(self.path == '/list_programs'): #list program uids for a given user
            length = int(self.headers['Content-length'])
            post_content = self.rfile.read(length)
            try:
                info = util.load_json(post_content)
            except:
                return self.do_error("Error Extracting JSON")
            if not (info.get('uid')  and info.get('password')):
                return self.do_error("Invalid user id, ignoring.")
            if str(info['password']) != "password":
                return self.do_error("Authentication Failed")

            uid = info['uid']
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
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

httpd = SocketServer.TCPServer(("0.0.0.0", PORT), ServerHandler)
httpd.allow_reuse_address = True # Prevent 'cannot bind to address' errors on restart....not working atm
print("Server active on {}",httpd.server_address)
httpd.serve_forever()
