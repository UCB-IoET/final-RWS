import requests
import json
import uuid
import time

d = {'/actuate': {'uuid': '3013e0e6-ed03-11e4-666c-5cc5d4ded1ae',
     'Readings': [[int(time.time()), 10]],
     'Metadata': {'override': "ac903027-3a81-5d2f-a5cb-7983f5fb9f0a"}}}

print requests.post('http://shell.storm.pm:8079/add/streetlight', data=json.dumps(d))

