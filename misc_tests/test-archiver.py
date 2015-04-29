import requests
import json
import time


# This is of the form host:port/add/apikey
# port will usually be 8079, and usually you'd have a pre-assigned
# API key, but we disabled that feature here for simplicity
archiverurl = 'http://shell.storm.pm:8079/add/mbs'

# we define our sMAP message as a regular Python dictionary
for i in range(10):
    smapsource = { "/sodahall/electric/meters/meter3":
                   {
  "Metadata" : {
      "SourceName" : "Test Source",
      "Location" : { "City" : "Berkeley" }
  },
  "Properties": {
      "Timezone": "America/Los_Angeles",
      "UnitofMeasure": "Watt",
      "ReadingType": "double"
  },    "Readings" : [[int(time.time()*1000), i]],
                       "uuid" : "d24325e6-1d7d-11e2-ad69-a7c2fa8dba61"
                   }
}
    # POST to the archiver. Should return a 200
    x = requests.post(archiverurl, data=json.dumps(smapsource))
    print(x)


