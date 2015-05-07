from smap import driver, util
import math, time

class SineWaveDriver(driver.SmapDriver):
        def setup(self, opts):
                self.step = float(opts.get('step', 1))
                self.rate = float(opts.get('rate', 1))
                self.amplitude = float(opts.get('amplitude', 1))
                self.t = 0
                self.add_timeseries('/sine', 'unit', data_type='double')
                self.set_metadata('/sine', {
                        'Metadata/Parametric': "true",
                        'Metadata/Step': str(self.step)})
        def start(self):
                util.periodicSequentialCall(self.read).start(self.rate)

        def read(self):
                value = self.amplitude * math.sin(self.t)
                self.t += self.step
                self.add('/sine', time.time(), value)
