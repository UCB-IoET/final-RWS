## Simple Manipulation and Actuation of Remote Things (SMART)
Final project for Running With Scissors

SMART allows users to graphically compose applications by tying together their
smap connected devices with additional control logic. The goal of this project
is for everyone to make the full use of their devices to meet individual specific
needs. SMART scans for available devices and allows the user to run any of their
created apps whose devices are all within range. The devices and control logic
are represented as nodes that can be connected together with 'wires' using an
intuitive drag and drop interface. SMART runs on desktop and mobile devices, but
we focused on mobile devices first as they are relatively common. Our intent is
for people at all levels of computational sophistication to realize new
applications and solutions with SMART.

## Running the server
The server accepts requests from the user application. It creates a new instance
of the interpreter in a new thread when the user wants to run one of their
programs. It is responsible for saving, starting, or stopping programs.

To run the server:

  > python server.py

## Demo sMAP sources
We created 8 sMAP streams to be used as sources for demoing SMART.
 - ambient and IR temperature
 - 3 buttons
 - accelerometer x,y,and z values

To load the firestorm code for these sources:

  > ./firestorm/build-source.lua

To run the middleware:

  > cd smap
  > python middleware.py

## Demo sMAP actuators
We created a few devices that may be actuated through sMAP. These have separate
sMAP drivers but share a single firestorm. These devices include an LED light
strip and a generic on/off device.

To load code for the actuator firestorm:
 > ./firestorm/build-actuator.lua

To run the smap driver for the LED strip:

 > cd actuation_driver
 > twistd -n smap streetlight.ini

To run the smap driver for the on/off device:

> cd smap/thing_driver
> twistd -n smap thing-driver.ini

## Dependencies
- PhoneGap
- Mobile Development SDK (Android/iOS)
- python
- ws4py
- a sMAP archiver
- sMAP enabled devices

## relevant files and directories

- **server.py**
   receives requests from phone app, sends programs to interpreter.py
- **interpreter.py**
   executes the user created programs
- **firestorm/**
   contains files for the firestorm sMAP devices
- **smap/**
   contains middleware and drivers for the sMAP sources
- **ioet-view/**
   contains all code for graphical program creation app running on Android/IOS
- **ioet-view/www/js/**
   logic for the phone app
- **test_server.py**
   Contains example programs in json form for testing the server and interpreter
- **primitiveConfig.js**
   config file for graphical app. Generate by running "./interpreter.py gen:prim"
