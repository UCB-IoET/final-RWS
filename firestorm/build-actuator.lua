#!/usr/bin/env lua

autorun = "streetlight_firestorm2.lua"

libs = {
    cord    = "../../contrib/lib/cord.lua",
    stormsh = "../../contrib/lib/stormsh.lua",
    lcd = "lcd.lua",
    reg = "i2creg.lua"
}

autoupdate = false
reflash_kernel = false


kernel_opts = {
    quiet = true,
    eth_shield = false
}


dofile("build_support.lua")
go_build()
