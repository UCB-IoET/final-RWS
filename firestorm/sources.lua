require "cord"
ACC = require "accel"
TEMP = require "temp"
shield = require "starter"

temp = TEMP:new()
acc = ACC:new()

shield.Button.start()
shield.LED.start()

--middleware_ip = "2001:470:66:b0::2"
middleware_ip = "2001:470:1f04:5f2::2"
middleware_ip = "2001:470:4956:1::1" 

udp_port = 8099 --1264

--1337
sendsock = storm.net.udpsocket(udp_port, function() print("something") end)

function reset_buttons()
   pressed_1 = false
   pressed_2 = false
   pressed_3 = false
end
reset_buttons()

function buttonAction(button)
   return function() 
      if button == 1 then
	 pressed_1 = true
      elseif button == 2 then
	 pressed_2 = true
      elseif button == 3 then
	 pressed_3 = true
      end
   end
end

shield.Button.whenever(1, "RISING", buttonAction(3))
shield.Button.whenever(2, "RISING", buttonAction(2))
shield.Button.whenever(3, "RISING", buttonAction(1))

cord.new(function ()
	    temp:init()
	    acc:init()
	    ir = temp:getIRTemp();
	    iter=0
	    while true do
	       iter = iter + 1;
	       ir_new = temp:getIRTemp()
	       ir = (ir_new*7000 + ir*3000)/10000	       
	       if iter % 5 == 0 then
		  iter = 0
		  amb = temp:getTemp() 
		  x, y, z, _, _, _  = acc:get()
		  t = {amb, ir, {pressed_1,pressed_2, pressed_3}, {x, y ,z}}
		  storm.net.sendto(sendsock, storm.mp.pack(t), middleware_ip, udp_port)
		  print("amb = " .. amb
			   .. "   IR =  "..ir.."C, "..storm.n.c_to_f(ir).."F")
		  print("accelerometer:", x, y, z)
		  print("buttons:",pressed_1,pressed_2, pressed_3)
		  print("\n")
		  reset_buttons()
	       end
	       cord.await(storm.os.invokeLater, 200 * storm.os.MILLISECOND)
	    end
	 end)

cord.enter_loop()
