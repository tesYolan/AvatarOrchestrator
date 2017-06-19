from xvfbwrapper import Xvfb
import pickle
import zerorpc

class ScreenCreator: 
    def __init__(self): 
        self.displays = {} # Make this dictionary. Yes, that makes much more sense.
        self.width = 1280
        self.height = 740

    def create_display(self,instance_name): 
        vdisplay = Xvfb(self.width,self.height)
        vdisplay.start()
        self.displays[instance_name] = vdisplay
        return vdisplay.new_display

    def stop_display(self,instance_name): 
        self.displays[instance_name].stop()
        #TODO remove it from dict. 
        del self.displays[instance_name]
        return True

# Okay, what is the logic function here: 
# Create a display and save data to pickle, then when it get's called, depending on the task. 
s = zerorpc.Server(ScreenCreator())
s.bind("tcp://0.0.0.0:3111")
s.run()
