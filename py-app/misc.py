from xvfbwrapper import Xvfb
import pickle
import zerorpc
import socket
import subprocess
import os
import distutils.spawn

class Misc: 
    def __init__(self): 
        self.displays = {} # Make this dictionary. Yes, that makes much more sense.
        self.width = os.environ['RESOLUTION_WIDTH']
        self.height = os.environ['RESOLUTION_HEIGHT']
        self.colordepth = 24
        self.ports = {}
        self.process = {}
        self.stream = 'rtmp' # hls or rtsp or rtmp or hls_http
        self.resolution = str(os.environ['RESOLUTION_WIDTH'])+'x'+ str(os.environ['RESOLUTION_HEIGHT'])
        try:
            self.FFMPEG = os.environ['FFMPEG']
        except KeyError:
            if distutils.spawn.find_executable('ffmpeg'):
                self.FFMPEG = 'ffmpeg'
            else:
                pass
                #raise Exception('FFMPEG executable not found')
        #self.FFMPEG = 'ffmpeg'
        self.STREAM_LOC = '../stream/'

        self.RTMP_IP = os.environ['RTMP_IP']
        self.HTTP_IP = os.environ['HTTP_IP']
        self.HTTPS_IP = os.environ['HTTPS_IP']

        self.RTMP_PORT = os.environ['RTMP_IP']
        self.HTTP_PORT = os.environ['HTTP_PORT']
        self.HTTPS_PORT = os.environ['HTTPS_PORT']

        self.LOG_LEVEL = 'error' # possible commands, quiet, panic, fatal, error, warning, info...

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

    def get_port(self,name): 
        return self.get_free_ports(1)

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
        if self.stream == 'hls':
            print('hls to file setup')
            self.process[instance_name] = subprocess.Popen([self.FFMPEG,'-loglevel',self.LOG_LEVEL,'-f','x11grab','-s',self.resolution,'-probesize','10M','-i',display_record,'-c:v','h264','-preset','ultrafast','-pix_fmt','yuv420p','-crf','0','-f','hls',self.STREAM_LOC+str(instance_name)+'.m3u8'])
        elif self.stream == 'hls_http':
            print('hls streaming setup using ngix')
            self.process[instance_name] = subprocess.Popen([self.FFMPEG,'-loglevel',self.LOG_LEVEL,'-f','x11grab','-s',self.resolution,'-probesize','10M','-i',display_record,'-c:v','h264','-preset','ultrafast','-pix_fmt','yuv420p','-crf','0','-f','hls','-method','PUT','https://' + self.HTTPS_IP + ':' + self.HTTPS_PORT + '/live/'+str(instance_name)+'.m3u8'])
        elif self.stream == 'rtmp':
            print('rtmp streaming setup')
            self.process[instance_name] = subprocess.Popen([self.FFMPEG,'-loglevel',self.LOG_LEVEL,'-f','x11grab','-s',self.resolution,'-probesize','10M','-i',display_record,'-c:v','h264','-c:a','aac','-preset','ultrafast','-pix_fmt','yuv420p','-crf','0','-f','flv','rtmp://' + self.RTMP_IP + ':' + self.RTMP_PORT + '/live/'+str(instance_name)])
            
        return True

s = zerorpc.Server(Misc())
rpc_port = "tcp://" + str(os.environ['RPC_IP'])+":"+str(os.environ['RPC_PORT'])
s.bind(rpc_port)
s.run()
