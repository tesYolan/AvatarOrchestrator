module.exports = {
  debug: '*LOG* *WARN* *ERROR* *mediasoup-worker*',
  domain: process.env.DOMAIN,
  tls: {
    cert: `${__dirname}/mediasoup-demo.localhost.cert.pem`,
    key: `${__dirname}/mediasoup-demo.localhost.key.pem`
  },
  mongo: {
    listenIp: process.env.MONGO_IP,
    listenPort: process.env.MONGO_PORT
  },
  docker: {
    listenIp: process.env.DOCKER_IP,
    image: process.env.DOCKER_IMAGE
  },
  stream:
  {
    listenIp: process.env.STREAM_IP,
    listenPort: process.env.STREAM_PORT
  },
  protoo: {
    listenIp: process.env.PROTOO_IP,
    listenPort: process.env.PROTOO_PORT
  },
  http: {
    listenIp: process.env.HTTP_IP,
    listenPort: process.env.HTTP_PORT
  },
  rtmpServer: {
    listenIp: process.env.RTMP_IP,
    listenPort: process.env.RTMP_PORT
  },
  resolution: {
    width: process.env.RESOLUTION_WIDTH,
    height: process.env.RESOLUTION_HEIGHT
  },
  mediasoup: {
    logLevel: 'warn',
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
        // This needs to be overloaded for new instances
        audio: {
          remoteIP: process.env.RTP_AUDIO_IP,
          remotePort: process.env.RTP_AUDIO_PORT
        },
        video: {
          remoteIP: process.env.RTP_VIDEO_IP,
          remotePort: process.env.RTP_VIDEO_PORT
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
      // }
      {
        kind: 'video',
        name: 'H264',
        clockRate: 90000,
        // payloadType: 123,
        parameters: {
          'packetization-mode': 1,
          'profile-level-id': '42e01f',
          'level-asymmetry-allowed': 1,
          'sprop-parameter-sets': 'Z0IAKeNQFAe2AtwEBAaQeJEV,aM48gA=='
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
