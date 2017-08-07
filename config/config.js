module.exports = {
  debug: '*LOG* *WARN* *ERROR* *mediasoup-worker*',
  domain: 'localhost',
  tls: {
    cert: `${__dirname}/mediasoup-demo.localhost.cert.pem`,
    key: `${__dirname}/mediasoup-demo.localhost.key.pem`
  },
  protoo: {
    listenIp: '0.0.0.0',
    listenPort: 3443
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
        name: 'video/vp8',
        clockRate: 90000
      }
    ],
    peerTransport: {
      udp: true,
      tcp: true
    },
    maxBitrate: 500000
  }
}
