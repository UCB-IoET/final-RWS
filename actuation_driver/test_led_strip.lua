--require("svcd")
require("cord")
sh = require("stormsh") 
--require("storm")

--[[
function sleep(n)
  os.execute("sleep " .. tonumber(n))
end


set_led = function(index, r,g,b )
	led:set(index, r,g,b)
	cord.await(storm.os.invokeLater, storm.os.SECOND)
	led:display()
end
--]]


led = storm.n.led_init(50, storm.io.D2, storm.io.D3)
led:display() 

i = 0
cord.new(function() 
while True do
	r = i
	g = 31-r
	b = 30 

	led:setAll(r,g, b)
	led:display()
	cord.await(storm.os.invokeLater, storm.os.SECOND/4)

        print(i) 
	print(r,g, b)
	if r>31 or r<0 then
	r = 0
	end
	if g>31 or g <0 then 
	g = 0
	end
	if b>31 or b<0 then 
	b = 0
	end
	i = i +1 
	if i>31 then i = 0 end 
    end
end) 


sh.start()

cord.enter_loop()
