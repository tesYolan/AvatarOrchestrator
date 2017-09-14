module.exports = {
  debug: '*LOG* *WARN* *ERROR* *mediasoup-worker*',
  domain: 'localhost',
  tls: {
    cert: `${__dirname}/mediasoup-demo.localhost.cert.pem`,
    key: `${__dirname}/mediasoup-demo.localhost.key.pem`
  },
  mongodb_ip: 'localhost',
  mongodb_port: '27017',
  docker_image: 'hanson:fresh',
  protoo: {
    listenIp: '192.168.1.48',
    listenPort: 3443
  },
  http: {
    listenPort: 3011
  },
  rtspServer: {
    listenIp: '192.168.1.48',
    listenPort: 5000
  },
  mediasoup: {
    logLevel: 'debug',
    logTags: [
      'info',
      'rtp',
      'rtcp',
      'rtx'
    ],
    rtcIPv4: true,
    rtcIPv6: true,
    rtcAnnouncedIPv4: null,
    rtcAnnouncedIPv6: null,
    rtcMinPort: 40000,
    rtcMaxPort: 49999,
    roomCodecs: [
      {kind: 'audio',
        name: 'audio/opus',
        clockRate: 48000,
        parameters: {
          useInbandFec: 1,
          minptime: 10
        }
      },
      {
        kind: 'video',
        name: 'video/h264',
        clockRate: 90000,
        payloadType: 123,
        parameters: {
          packetizationMode: 1
        }
      }
    ],
    peerTransport: {
      udp: true,
      tcp: true
    },
    maxBitrate: 500000
  }
}
