#!/usr/bin/python

import requests
import json


#curl -XPOST -d 'Metadata/SourceName = "Gabe Sine Wave Driver"' http://shell.storm.pm:8079/republish

from ws4py.client.threadedclient import WebSocketClient

class Subscription(WebSocketClient):
    def __init__(self, url, select, cb):
        super(Subscription, self).__init__(url)
        self.select = select
        self.cb = cb

    def opened(self):
        self.send(self.select)

    def closed(self, code, reason=None):
        print "Closed down", code, reason

    def received_message(self, m):
        self.cb(m)

def cb(m):
    print(m)

try:

    ws = Subscription('ws://shell.storm.pm:8078/republish',
                      #"Metadata/SourceName = 'Gabe Sine Wave Driver'",
                      'uuid = "71be455c-2eac-50d3-ac03-81fae87b0ee3"',
                      cb)
    ws.connect()
    ws.run_forever()
except KeyboardInterrupt:
    ws.close()
