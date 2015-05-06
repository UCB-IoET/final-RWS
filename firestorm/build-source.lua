#!/usr/bin/env lua

autorun = "smap_ir_source.lua"
libs = {
   reg = "i2creg.lua",
   temp = "tempSensor.lua",
   cord = "../../contrib/lib/cord.lua",
   stormsh = "../../contrib/lib/stormsh.lua",
   accel = "../../contrib/lib/accelerometer.lua",
   starter = "../../contrib/lib/starterShield.lua"
}

autoupdate = false
reflash_kernel = false


kernel_opts = {
    quiet = true,
    eth_shield = false
}


dofile("build_support.lua")
go_build()
