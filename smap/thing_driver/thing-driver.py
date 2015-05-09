from smap import driver, actuate
from smap.util import periodicSequentialCall
import msgpack
import socket

#supernode:
#UDP_IP = "2001:470:832b:2:212:6d02::3017"
#invention lab:
UDP_IP = "2001:470:4956:2:212:6d02::3017"
UDP_PORT = 1444 

import threading
import importlib

class Thing(driver.SmapDriver):
    def setup(self, opts):
        self.state = {'on': 0}
        self.readperiod = float(opts.get('ReadPeriod', .5))
        on = self.add_timeseries('/on', 'On/Off', data_type='long')

        self.set_metadata('/', {'Metadata/Device': 'Lighting Controller',
                                'Metadata/Model': 'something',
                                'Metadata/Driver': __name__})

        archiver = opts.get('archiver')
        on.add_actuator(OnOffActuator(thing=self,
                                      archiver=archiver,
                                      subscribe=opts.get('on')))
        metadata_type = [
            ('/on','Reading'),
            ('/on_act','Command'),
        ]
        for ts, tstype in metadata_type:
            self.set_metadata(ts,{'Metadata/Type':tstype})

    def start(self):
        periodicSequentialCall(self.read).start(self.readperiod)

    def read(self):
        for k,v in self.state.iteritems():
            self.add('/'+k, v)

class ThingActuator(actuate.SmapActuator):
    def __init__(self, **opts):
        self.thing = opts.get('thing')
        actuate.SmapActuator.__init__(self, opts.get('archiver'))
        self.subscribe(opts.get('subscribe'))


class OnOffActuator(ThingActuator, actuate.BinaryActuator):
    def __init__(self, **opts):
        actuate.BinaryActuator.__init__(self)
        ThingActuator.__init__(self, **opts)

    def get_state(self, request):
        return self.thing.state.get('on')

    def set_state(self, request, state):
        print "SET_STATE({})".format(state)
        msg = {'on?':1 if state else 0}
        msg_pack = msgpack.packb(msg)
        sock = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)
        sock.sendto(msg_pack, (UDP_IP, UDP_PORT))
        self.state = state
        return state#???
        self.thing.state['on'] = int(state)
        return self.thing.state.get('on')

