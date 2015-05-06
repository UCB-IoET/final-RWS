--require("svcd")
--require("cord")
sh = require("stormsh") 
--require("storm")

led = storm.n.led_init(30, storm.io.D2, storm.io.D3)
led:display() 
led:set(10, 30, 30, 30) 
led:setAll(30, 30, 30) 
led:display()  

sh.start()

cord.enter_loop()
