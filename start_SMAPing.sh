cd smap/middleware
python middleware.py &

cd ../sinewave
twistd -n smap sinewave.ini &

cd ../thing_driver
twistd -n smap thing-driver.ini &


cd ../../actuation_driver
twistd -n smap streetlight.ini &
