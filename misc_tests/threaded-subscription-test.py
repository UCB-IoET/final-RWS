#!/usr/bin/python

import requests
import json
import Queue
import thread
from util import load_json

#curl -XPOST -d 'Metadata/SourceName = "Gabe Sine Wave Driver"' http://shell.storm.pm:8079/republish


from ws4py.client.threadedclient import WebSocketClient

next_id = 0;
class Subscription(WebSocketClient):
    def __init__(self, url, select, cb):
        global next_id
        super(Subscription, self).__init__(url)
        self.select = select
        self.cb = cb
        self.ID = next_id
        next_id += 1;

    def opened(self):
        self.send(self.select)

    def closed(self, code, reason=None):
        print "Closed down", code, reason

    def received_message(self, m):
        self.cb(self.ID, m)

q = Queue.Queue(0)
threads = []
def cb(thread_id, m):
    q.put((thread_id, m.data))
    
def subscribe(url, select):
    try:
        ws = Subscription(url, select, cb)
        ws.connect()
        ws.run_forever()
    except KeyboardInterrupt:
        ws.close()

def new_subscription(url, select):
    tid = thread.start_new_thread(subscribe, (url, select))
    threads.append(tid)


new_subscription('ws://shell.storm.pm:8078/republish',
                 "Metadata/SourceName = 'Gabe Sine Wave Driver'")
new_subscription('ws://shell.storm.pm:8078/republish',
                 "Metadata/SourceName = 'Gabe Sine Wave Driver'")

while True:
    x = q.get()
    print "="*80
    print "From: ", x[0]
    print load_json(x[1])
         
