from xvfbwrapper import Xvfb
import pickle
import zerorpc
import socket
import subprocess

class Misc: 
    def __init__(self): 
        self.displays = {} # Make this dictionary. Yes, that makes much more sense.
        self.width = 1366
        self.height = 768
        self.colordepth = 24
        self.ports = {}
        self.process = {}

    def create_display(self,instance_name,num_ports): 
        vdisplay = Xvfb(self.width,self.height,self.colordepth)
        vdisplay.start()
        self.displays[instance_name] = vdisplay
        ports = self.get_free_ports(num_ports)
        self.ports[instance_name] = ports
        self.create_video(instance_name)
        return vdisplay.new_display, ports

    def stop_display(self,instance_name): 
        self.displays[instance_name].stop()
        #TODO remove it from dict. 
        del self.displays[instance_name]
        del self.ports[instance_name]
        self.process[instance_name].kill()
        del self.process[instance_name]
        return True

    def get_free_ports(self,number_of_ports):
        ports = []
        all_ports = [item for sublist in self.ports.values() for item in sublist]
        for i in range(number_of_ports):
            while(True):
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.bind(("",0))
                port = s.getsockname()[1]
                s.close()
                if port not in all_ports and port not in ports:
                    ports.append(port)
                    break
        return ports
    def create_video(self,instance_name):
        # TODO in this funciton, create a video .avi/.mp4 to any location. Then it stops when it stops. 
        display_record = ':' + str(self.displays[instance_name].new_display)
        # Command to change to process command. 
        # ffmpeg -f alsa -i default -f x11grab -s 1366x768 -r 30 -i :0.0 -sameq filename.avi
        self.process[instance_name] = subprocess.Popen(['/home/tyohannes/Downloads/ffmpeg-3.3.2-64bit-static/ffmpeg','-f','x11grab','-s','1360x768','-probesize','10M','-i',display_record,'-c:v','h264','-preset','ultrafast','-pix_fmt','yuv420p','-crf','0','-f','rtsp','rtsp://127.0.0.1:8099/live/'+str(instance_name)])
        return True


# Okay, what is the logic function here: 
# Create a display and save data to pickle, then when it get's called, depending on the task. 
s = zerorpc.Server(Misc())
s.bind("tcp://0.0.0.0:3111")
s.run()
