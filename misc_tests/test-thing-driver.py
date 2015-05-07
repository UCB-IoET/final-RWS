import requests
import json
import uuid
import time

d = {'/actuate': {'uuid': '3013e0e6-ed03-11e4-666c-5cc5d4ded1ae',
                  'Readings': [[int(time.time()), 1]],
                  'Metadata': {'override': "e843c8f7-c6df-56c4-81f5-982ba67f57f0"}}}

print requests.post('http://shell.storm.pm:8079/add/streetlight', data=json.dumps(d))
