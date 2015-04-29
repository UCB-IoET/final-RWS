import requests
import time
import json
from util import load_json

#uuid of the _act stream we wish to actuate
# => IOET Class/guildinggeneral/plugstrip0/outlet7/on_act
uuid = "52edbef3-98e9-5cef-8cc9-9ddee810cd5d"

#uuid of our stream
act_stream_uuid = "52edbddd-98e9-5cef-8cc9-9ddee810cd88"

# value to send for 'Readings'
state = 1 #1 or 0

#query url
q_url = "http://shell.storm.pm:8079/api/query"

#actuation url
a_url = "http://shell.storm.pm:8079/add/apikey"


#query the acutation stream for 'Properties'
try:
    r = "select * where uuid = '{}'".format(uuid)
    resp = requests.post(q_url, r)
    j = load_json(resp.text)
    properties = j[0]['Properties']
except:
    print "failed to extract 'propereties'"
    exit(1)

#construct our actuation request
act = {'/actuate': {'uuid': act_stream_uuid,
                    'Readings': [[int(time.time()), state]],
                    'Properties': properties,
                    'Metadata':{'override': uuid}}}       

print "sending to archiver: {}".format(act)


print requests.post(a_url, data=json.dumps(act))
