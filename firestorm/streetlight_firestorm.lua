require "cord" -- scheduler / fiber library
LCD = require "lcd"

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
lcd = LCD:new(storm.i2c.EXT, 0x7c, storm.i2c.EXT, 0xc4)

on = false
function set_on()
   cord.new(function ()
	       print("set_on")
	       lcd:setCursor(1, 0)
	       lcd:writeString("--> ON <-- ")
	       lcd:setBackColor(0 , 255, 0)
	       on = true
	    end)
end

function set_off()
   cord.new(function ()
	       print("set_off")
	       lcd:setCursor(1, 0)
	       lcd:writeString("--> OFF <--")
	       lcd:setBackColor(255, 0, 0)
	       on = false
	    end)
end


led:display()
listen_port = 1444


cord.new(
   function ()
      server = function()
	 ssock = storm.net.udpsocket(listen_port,
				     function(payload, from, port)
					print (string.format("from %s port %d: %s",from,port,payload))
					local msg = storm.mp.unpack(payload)
					print("msg[on?]==>", msg["on?"])
					if msg["on?"] then
					   print("YES")
					   if msg["on?"] == 0 then
					      set_off()
					   else
					      set_on()
					   end
					else
					   local color = msg["rgb"]
					   print("message: ", msg)
					   print("index: ", msg["index"])
					   print("rgb: ", msg["rgb"])
					   --local r = bit.band(bit.rshift(color, 5), 0x1F)
					   --local g = bit.band(color, 0x1F)

					   --local b = bit.band(bit.rshift(color, 10), 0x1F)

					   r = msg["rgb"]
					   print(r, g, b)
					   led:setAll(r, r, r)
					   led:display()
					end

				     end)
      end

      lcd:init(2, 1)
      lcd:setCursor(1, 0)
      lcd:writeString("     RWS")
      set_off()
      server()
   end)


-- enable a shell
sh = require "stormsh"
sh.start()
cord.enter_loop() -- start event/sleep loop
