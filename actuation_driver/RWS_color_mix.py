import time
import urllib2
import sys
import msgpack
import socket
from smap.archiver.client import RepublishClient
from smap.util import periodicSequentialCall
from smap import driver, util, actuate


class streetLight(driver.SmapDriver):

    def setup(self, opts):
	self.state = {
                      'rgb': 30,
                      } 
	archiver = opts.get('archiver')
        self.rate = float(opts.get('rate', 5))
        self.add_timeseries('/index', 'unit', data_type='double')
	rgb = self.add_timeseries('/rgb', 'unit', data_type='double')
	speed = self.add_timeseries('/speed', 'unit', data_type='double')

	self.archiverurl = opts.get('archiverurl','http://shell.storm.pm:8079')                                                
        self.subscription_index = opts.get('subscription','Path= "/RWS_color_mix/1/index"')
	self.subscription_rgb = opts.get('subscription','Path= "/RWS_color_mix/1/rgb"')
	self.subscription_speed = opts.get('subscription','Path= "/RWS_color_mix/1/speed"')
        #self.r1 = RepublishClient(self.archiverurl, self.cb_index, restrict=self.subscription_index) 
	#self.r2 = RepublishClient(self.archiverurl, self.cb_rgb, restrict=self.subscription_rgb)  
	self.table = {} 
	rgb.add_actuator(RGBActuator(light=self,range=(0,31), archiver=archiver, subscribe=opts.get('rgb')))
	speed.add_actuator(SpeedActuator(light=self,range=(1,2000), archiver=archiver, subscribe=opts.get('speed')))
 
    def start(self):
	#self.r1.connect()
	#self.r2.connect()
	self.add('/rgb', float(1))
	self.add('/speed', float(1))	
	#util.periodicSequentialCall(self.send_rgb).start(1)
	#periodicSequentialCall(self.read).start(self.rate)

    def read(self):
	self.add('/rgb', float(1))
	self.add('/speed', float(1))

    def stop(self):
     print "Quit"
     self.stopping = True

class VirtualLightActuator(actuate.SmapActuator):
	    def __init__(self, **opts):
		self.light = opts.get('light')
		actuate.SmapActuator.__init__(self, opts.get('archiver'))
		self.subscribe(opts.get('subscribe'))

class OnOffActuator(VirtualLightActuator, actuate.BinaryActuator):
	    def __init__(self, **opts):
		actuate.BinaryActuator.__init__(self)
		VirtualLightActuator.__init__(self, **opts)


class RGBActuator(VirtualLightActuator, actuate.ContinuousActuator):
    def __init__(self, **opts):
        actuate.ContinuousActuator.__init__(self, opts['range'])
        VirtualLightActuator.__init__(self, **opts)

    def get_state(self, request):
        return self.light.state.get('rgb')

    def set_state(self, request, state):
	print("_____________________________________PRINTING RECEIVED STATE:______________________________________")
	print(state)

        self.light.state['rgb'] = float(state)
        #return self.light.state.get('rgb')  

	msg = {}
	msg["index"] = 30
	msg["rgb"] = state
	print msg
	msg_pack = msgpack.packb(msg)
	
	UDP_IP = "2001:470:832b:2:212:6d02::3017"
	#UDP_IP = "2001:470:4956:2:212:6d02::3017"
	# UDP_IP = "2001:0470:832b:0002::0212:6d02:0000:3017" #all IPs
	UDP_PORT = 1444 
 
	# Note we are creating an INET6 (IPv6) socket
	sock = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)

	sock.sendto(msg_pack, (UDP_IP, UDP_PORT))
	return self.light.state.get('rgb')


class SpeedActuator(VirtualLightActuator, actuate.ContinuousActuator):
    def __init__(self, **opts):
        actuate.ContinuousActuator.__init__(self, opts['range'])
        VirtualLightActuator.__init__(self, **opts)

    def get_state(self, request):
        return self.light.state.get('speed')

    def set_state(self, request, state):
	print("_____________________________________PRINTING RECEIVED STATE:______________________________________")
	print(state)

        self.light.state['speed'] = float(state)
        #return self.light.state.get('rgb')  

	msg = {}
	msg["index"] = 30
	msg["speed"] = state
	print msg
	msg_pack = msgpack.packb(msg)
	
	UDP_IP = "2001:470:832b:2:212:6d02::3017"
	#UDP_IP = "2001:470:4956:2:212:6d02::3017"
	# UDP_IP = "2001:0470:832b:0002::0212:6d02:0000:3017" #all IPs
	UDP_PORT = 1444 
 
	# Note we are creating an INET6 (IPv6) socket
	sock = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)

	sock.sendto(msg_pack, (UDP_IP, UDP_PORT))
	
	return self.light.state.get('speed')






