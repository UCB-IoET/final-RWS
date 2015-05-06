README

####################
# File description #
####################
streetlight.ini + streetlight.py -> upload to server using: scp streetlight.ini qchong@shell.storm.pm:/home/qchong etc.
 
streetlight_firestorm.lua -> push to firestorm after #Enabling LED strip library#

test_led_strip.lua -> v. basic, just runs some basic led commands to test that it is working 

test_led_actuation.py -> sends an actuation request with uuid corresponding to actuator in override field. 

##############################
# Enabling LED strip library #
##############################

Go to: 
https://github.com/aishp/ioet_contrib/commit/884fe05c199baab9ad7667ee0babd581c6fd31fd (commit from asihp's repo)
and copy (over-write) the native.c and natlib/led_strip.c files in your contrib directory 

#########
# Steps #
#########

1. Push streetlight_firestorm.lua to firestorm after enabling library, with power supply and firestorm sharing common ground. Firestorm now listening for actuation requests on from server: 2001:0470:4956:0002::0012:6d02:0000:3017, Port 1444. (I didn't truncate the ip, may have to)
2. Copy streetlight.ini and streetlight.py to server. Run twistd -n smap streetlight.ini. Server is now listening for actuation requests from app or direct requests. 
3. Run test_led_actuation.py. You should see the server print the rgb value you sent. Currently it is just the "r" value being sent under "rgb".

###############
# Other links #
###############

actual driver for actuable oulets that were in invention lab:
https://github.com/SoftwareDefinedBuildings/smap/blob/unitoftime/python/smap/drivers/echola_spdu108l.py#L99

actuator driver example: 
https://github.com/SoftwareDefinedBuildings/smap/blob/unitoftime/python/smap/drivers/lights/virtuallight.py#L20

to check data made it to archiver: 
smap-query -u http://shell.storm.pm:8079/api/query
select * where Metadata/SourceName="streetlight"
select data before now where Metadata/SourceName="streetlight"

plotter: shell.storm.pm under streetlight

