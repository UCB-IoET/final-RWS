REG = require("reg") -- i2c registration library, must support multiple read and write. 
require("storm")
require("cord")

----------------------------------------------
-- Temperature Sensor class for the onboard I2C 
-- TI TMP006 Temperature Sensor
-- 
-- Suggested usage:
-- TEMP = require("temp")
-- temp = TEMP:new()
-- temp:init()
-- temp:getTemp()
--
-- * All constants are loaded into native.c to same memory space. 
----------------------------------------------
local TEMP = {}

-- Create a new temperature sensor instance
function TEMP:new()
   local obj = {port=storm.i2c.INT, 
                addr = 0x80, 
                reg=REG:new(storm.i2c.INT, 0x80)}
   setmetatable(obj, self)
   self.__index = self
   return obj
end


-- Init the temp sensor by setting the CONFIG register
-- Turn it on: 0x7000
-- Set Conversion rate:
--  4/s : 0x0000
--  2/s : 0x0200
--  1/s : 0x0400
--  0.5/s : 0x0600
--  0.25/s : 0x0800
-- Enable data ready pin: 0x0100
function TEMP:init()
    self.reg:w(storm.n.TMP006_CONFIG, {0x00 + 0x70 + 0x01, 0x00})
    return true
end

-- Reset the temp sensor by setting CONFIG register to 0x8000
function TEMP:reset()
    -- reset the sensor, this bit self clears
    self.reg:w(storm.n.TMP006_CONFIG, {0x80, 0x00})
    return true
end

--Read ambient temperature
function TEMP:getTemp()
    local result = self.reg:r(storm.n.TMP006_LOCAL_TEMP, 2)
    --Converting temperature into Celsius (each LSB = 1/32 Deg. Celsius)
    return result:get_as(storm.array.INT16_BE, 0) / 128
end


--Read IR temperature
--
--References:
-- http://www.ti.com/lit/ug/sbou107/sbou107.pdf
--   page 9: ir temp calculations
-- http://www.ti.com.cn/cn/lit/ds/sbos518d/sbos518d.pdf
--   page 19: i2c registers
--   page 12: ir temp calculations
-- source code for ir temp calculation:
--   http://processors.wiki.ti.com/index.php/SensorTag_User_Guide#IR_Temperature_Sensor
function TEMP:getIRTemp()
   local v_reg = self.reg:r(storm.n.TMP006_VOLTAGE, 2)
   local voltage = v_reg:get_as(storm.array.INT16_BE, 0)
   local a_reg = self.reg:r(storm.n.TMP006_LOCAL_TEMP, 2)
   local ambient = a_reg:get_as(storm.array.INT16_BE, 0)/128
   return storm.n.TMP006_ir_calc(voltage, ambient)
end

-- Read configuration register
function TEMP:getConfig()
    local result = self.reg:r(storm.n.TMP006_CONFIG, 2)
    local config = bit.rshift(result:get_as(storm.array.INT16_BE,0), 7)
    return config
end

--reading 8th bit of configuration, which indicates if conversion is ready
function TEMP:isReady()
    return bit.band(self:getConfig(), 0x0001) == 0x0001
end

--Read Mfg ID, should be 21577
function TEMP:get_mfg_id()
    local result = self.reg:r(storm.n.TMP006_MFG_ID, 2)
    local mfg_id = result:get_as(storm.array.INT16_BE,0)
    return mfg_id
end

--Read Device ID, should be 103
function TEMP:get_dev_id()
    local result = self.reg:r(storm.n.TMP006_DEVICE_ID, 2)
    local dev_id = result:get_as(storm.array.INT16_BE,0)
    return dev_id
end

function TEMP:get_raw_voltage()
    -- Get the sensor voltage reading result directly in uV
    local result = self.reg:r(storm.n.TMP006_VOLTAGE, 2)
    -- Each LSB is 156.25 nV, we convert it to mV
    local voltage = result:get_as(storm.array.INT16_BE,0) * 156 / 1000
    return voltage 
end

return TEMP
