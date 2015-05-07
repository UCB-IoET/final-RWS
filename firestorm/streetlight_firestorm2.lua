require "cord" -- scheduler / fiber library
LCD = require "lcd"

speed=2
sent_value = 30 
rgb_off=0

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
   lcd:setCursor(1, 0)
   lcd:writeString("--> ON <-- ")
   lcd:setBackColor(0 , 255, 0)
   on = true
end

function set_off()
   lcd:setCursor(1, 0)
   lcd:writeString("--> OFF <--")
   lcd:setBackColor(255, 0, 0)
   on = false
end


led:display()
listen_port = 1444
server = function()
   ssock = storm.net.udpsocket(listen_port,
			       function(payload, from, port)
				  print (string.format("from %s port %d: %s",from,port,payload))
				  local msg = storm.mp.unpack(payload)
				  
				  if msg["on?"] then
				     if msg["on?"] == 0 and on == 1 then
					set_off()
				     elseif on == 0 then
					set_on()
				     end

				elseif msg["speed"] then 
						rgb_off=1
						print("hii")
						--led:setAll(30,30,30)
						--led:display()
						print(msg["speed"])
						speed = msg["speed"]
						   

				     else
				     rgb_off=0
				     local color = msg["rgb"]
				     print("message: ", msg)
				     print("index: ", msg["index"])
				     print("rgb: ", msg["rgb"])
				     --local r = bit.band(bit.rshift(color, 5), 0x1F)
				     --local g = bit.band(color, 0x1F)
				     --local b = bit.band(bit.rshift(color, 10), 0x1F)

				     sent_value = msg["rgb"]
				     static = sent_value
				     r= sent_value
				     print(sent_value)
				     --print(r, g, b)
				     led:setAll(r, 30,30)
				     led:display()
				     end

			       end)
end


i = 0
cord.new(function() 


							while true do 
								 					  
									r = sent_value
									
									b = i
									g = 31-b

									--if rgb_off==0 then r= static end
									--if rgb_off==0 then g=static end
									--if rgb_off==0 then b=static end

									led:setAll(r,g, b)
									led:display()
									cord.await(storm.os.invokeLater, storm.os.MINUTE/speed)

									print(i) 
									print(r,g, b)
									if r>31 or r<0 then
									r = 0
									end
									if g>31 or g <0 then 
									g = 0
									end
									--if b>31 or b<0 then 
									--b = 0
									--end

									i = i +1 
									if i>31 then i = 0 end 
								
								end

						end)

cord.new(function ()
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
