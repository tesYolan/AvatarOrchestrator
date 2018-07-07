import os
import socket
import zerorpc

class Misc:
    def __init__(self):
        self.displays = {}
        self.ports = {}
        self.display = os.environ['DISPLAY']
        self.LOG_LEVEL = 'error' # possible commands, quiet, panic, fatal, error, warning, info...

    def create_display(self,instance_name,num_ports):
        self.displays[instance_name] = self.display
        ports = self.get_free_ports(num_ports)
        self.ports[instance_name] = ports
        return self.display, ports

    def stop_display(self,instance_name):
        del self.displays[instance_name]
        del self.ports[instance_name]
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

s = zerorpc.Server(Misc())
rpc_port = "tcp://" + str(os.environ['RPC_IP'])+":"+str(os.environ['RPC_PORT'])
s.bind(rpc_port)
s.run()
