import time
import requests 

def blink_light():
    for i in range(10):
        requests.put('http://169.229.223.190:8081/data/buildinggeneral/plugstrip0/outlet2/on_act?state={0}'.format(i%2))
        time.sleep(1)

def query_temp():
    #http://proj.storm.pm:8081/data/buildinghvac/thermostat0/temp
    x = requests.get('http://proj.storm.pm:8081/data/buildinghvac/thermostat0/temp')
    print(x.text)
    
