require "cord" -- scheduler / fiber library
bit = require "bit"

ipaddr = storm.os.getipaddr()
ipaddrs = string.format("%02x%02x:%02x%02x:%02x%02x:%02x%02x::%02x%02x:%02x%02x:%02x%02x:%02x%02x",
			ipaddr[0],
			ipaddr[1],ipaddr[2],ipaddr[3],ipaddr[4],
			ipaddr[5],ipaddr[6],ipaddr[7],ipaddr[8],	
			ipaddr[9],ipaddr[10],ipaddr[11],ipaddr[12],
			ipaddr[13],ipaddr[14],ipaddr[15])
print("ip addr", ipaddrs)
print("node id", storm.os.nodeid())

led = storm.n.led_init(50, storm.io.D2, storm.io.D3)
led:display()
listen_port = 1444
server = function()
   ssock = storm.net.udpsocket(listen_port, function(payload, from, port)
				                    print (string.format("from %s port %d: %s",from,port,payload))
                                    local msg = storm.mp.unpack(payload)
                                    local color = msg["rgb"]
                                    print(msg)
                                    print(msg["index"])
                                    print(msg["rgb"])
                                    --local r = bit.band(bit.rshift(color, 5), 0x1F)
                                    --local g = bit.band(color, 0x1F)
                                    --local b = bit.band(bit.rshift(color, 10), 0x1F)
                                    print(r, g, b)
                                    led:setAll(r, 30, 30)
                                    led:display()
			                    end)
end

server()
-- enable a shell
sh = require "stormsh"
sh.start()
cord.enter_loop() -- start event/sleep loop
