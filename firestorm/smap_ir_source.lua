require "cord"

TEMP = require "temp"
temp = TEMP:new()

--middleware_ip = "2001:470:66:b0::2"
middleware_ip = "2001:470:1f04:5f2::2"
middleware_ip = "2001:470:4956:1::1" 

udp_port = 8099 --1264

--1337
sendsock = storm.net.udpsocket(udp_port, function() print("something") end)

cord.new(function ()
	    temp:init()
	    ir = temp:getIRTemp();
	    iter=0
	    while true do
	       iter = iter + 1;
	       ir_new = temp:getIRTemp()
	       ir = (ir_new*7000 + ir*3000)/10000	       
	       if iter % 5 == 0 then
		  iter = 0
		  amb = temp:getTemp() 
		  t = {amb, ir}
		  storm.net.sendto(sendsock, storm.mp.pack(t), middleware_ip, udp_port)
		  print("amb = " .. amb
			   .. "   IR =  "..ir.."C, "..storm.n.c_to_f(ir).."F")
	       end
	       cord.await(storm.os.invokeLater, 200 * storm.os.MILLISECOND)
	    end
	 end)

cord.enter_loop()
