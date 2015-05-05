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

#        self.set_metadata('/led_app', {
#                          'Metadata/Description' : 'Application to link PIR to LED',
#                         })

	self.archiverurl = opts.get('archiverurl','http://shell.storm.pm:8079')                                                
        self.subscription_index = opts.get('subscription','Path= "/streetlight/1/index"')
	self.subscription_rgb = opts.get('subscription','Path= "/streetlight/1/rgb"')
        #self.r1 = RepublishClient(self.archiverurl, self.cb_index, restrict=self.subscription_index) 
	#self.r2 = RepublishClient(self.archiverurl, self.cb_rgb, restrict=self.subscription_rgb)  
	self.table = {} 
	rgb.add_actuator(RGBActuator(light=self,range=(0,31), archiver=archiver, subscribe=opts.get('rgb')))
	self.UDP_IP = "2001:0470:4956:0002::0012:6d02:0000:3017" #all IPs
	self.UDP_PORT = 1444 
 
	# Note we are creating an INET6 (IPv6) socket
	self.sock = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)

    """
    def start(self):
	# call self.read every self.rate seconds


    def read(self):
	#r = requests.get(self.readURL)
	#data_xml = r.content.strip(" \r\n\t")
	#data_dict = xmltodict.parse(data_xml).get('response')

	#for k in range(1,9):
	#    self.add('/outlet' + str(k) + '/on', int(data_dict['pstate' + str(k)]))
	#    self.add('/outlet' + str(k) + '/power', float(data_dict['pow' + str(k)]))
    """

    def cb_index(self, points, led_index ):
        print "Points: ",points
	print "\nData" , led_index

	print "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
	print self.table
#	index = led_index[0][0][-1] + 0.0
	index = led_index[0][0][-1] + 0.0
	
	curr_time = time.time()
#	self.add('/index',curr_time, index)
	self.add('/index', curr_time, index)
	if (led_index[0][0][-2] not in self.table.keys()):
		self.table[led_index[0][0][-2]] = {}
	self.table[led_index[0][0][-2]][0] = index

    """
    def cb_rgb(self, points, led_rgb ):
        #print "Points: ",points
	#print "\nData" , led_rgb

	#print "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
#	index = led_index[0][0][-1] + 0.0
	rgb = led_rgb[0][0][-1] + 0.0
	
	curr_time = time.time()
#	self.add('/index',curr_time, index)
	self.add('/rgb', curr_time, rgb)
	if (led_rgb[0][0][-2] not in self.table.keys()):
		self.table[led_rgb[0][0][-2]] = {}
	self.table[led_rgb[0][0][-2]][1] = rgb

    def send_rgb(self):
	#print "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC"
	#print "Sending data to led strip"
	if (len(self.table.keys()) > 0):
		earliest_time = min(self.table, key=self.table.get)
		index = self.table[earliest_time][0]
		rgb = self.table[earliest_time][1]
		del self.table[earliest_time]
		msg = {}
		msg["index"] = index
		msg["rgb"] = rgb
		print msg
		msg_pack = msgpack.packb(msg)
		self.sock.sendto(msg_pack, (self.UDP_IP, self.UDP_PORT))
    """

    def start(self):
	#self.r1.connect()
	#self.r2.connect()
	self.add('/rgb', float(1))	
	#util.periodicSequentialCall(self.send_rgb).start(1)
	#periodicSequentialCall(self.read).start(self.rate)

    def read(self):
	self.add('/rgb', float(1))

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
        return self.light.state.get('rgb')  
	if (len(self.table.keys()) > 0):
		earliest_time = min(self.table, key=self.table.get)
		index = self.table[earliest_time][0]
		rgb = self.table[earliest_time][1]
		del self.table[earliest_time]
		msg = {}
		msg["index"] = 30
		msg["rgb"] = rgb
		print msg
		msg_pack = msgpack.packb(msg)
		self.sock.sendto(msg_pack, (self.UDP_IP, self.UDP_PORT))









