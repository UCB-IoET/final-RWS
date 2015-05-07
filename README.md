## Simple Manipulation and Actuation of Remote Things (SMART)
Final project for Running With Scissors


## smap sources

To load code for source firestorm, provides ir tmp, buttons, and accelerometer SMAP sources:
  ./firestorm/build-source.lua

To run the middleware:

  "cd smap"
  
  python middleware.py

## smap actuators

To load code for actuator firestorm, controls light strip
  ./firestorm/build-actuator.lua

To run the smap driver:
  cd actuation_driver
  twistd -n smap streetlight.ini


## start the server

python server.py

