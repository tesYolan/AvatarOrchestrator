module.exports = {
  debug: '*LOG* *WARN* *ERROR* *mediasoup-worker*',
  domain: 'localhost',
  tls: {
    cert: `${__dirname}/mediasoup-demo.localhost.cert.pem`,
    key: `${__dirname}/mediasoup-demo.localhost.key.pem`
  },
  mongodb_ip: 'localhost',
  mongodb_port: '27017',
  docker_ip: '0.0.0.0',
  docker_image: 'hanson:rpc',
  protoo: {
    listenIp: '192.168.1.38',
    listenPort: 3443
  },
  http: {
    listenPort: 3011
  },
  rtmpServer: {
    listenIp: '192.168.1.38',
    listenPort: '5442'
  },
  rtspServer: {
    listenIp: '192.168.1.38',
    listenPort: 5000
  },
  resolution: {
    width: '1366',
    height: '768'
  },
  mediasoup: {
    logLevel: 'debug',
    logTags: [
      'info',
      'ice',
      'dlts',
      'rtp',
      'srtp',
      'rtcp',
      'rbe',
      'rtx'
    ],
    rtcIPv4: true,
    rtcIPv6: true,
    rtcAnnouncedIPv4: null,
    rtcAnnouncedIPv6: null,
    rtcMinPort: 40000,
    rtcMaxPort: 49999,
    rtpConfig:
      {
        audio: {
          remoteIP: '192.168.1.38',
          remotePort: 5002
        },
        video: {
          remoteIP: '192.168.1.38',
          remotePort: 5005
        }
      },
    mediaCodecs: [
      {
        kind: 'audio',
        name: 'opus',
        clockRate: 48000,
        channels: 2,
        parameters: {
          useinbandfec: 1
        }
      },
      // {
      //  kind: 'video',
      //  name: 'VP8',
      //  clockRate: 90000
      // },
      {
        kind: 'video',
        name: 'H264',
        clockRate: 90000,
        // payloadType: 123,
        parameters: {
          'packetization-mode': 1,
          'profile-level-id': '42e01f',
          'level-asymmetry-allowed': 1
        }
      }
    ],
    // peertransport: {
    //  udp: true,
    //  tcp: true
    // },
    maxbitrate: 500000
  }
}
