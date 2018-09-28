module.exports = {
  peerStar: {
    ipfs: {
      swarm: ['/dns4/rendezvous.jimpick.com/tcp/9091/wss/p2p-websocket-star'], // Demo
      // swarm: ['/dns4/rendezvous.jimpick.com/tcp/9093/wss/p2p-websocket-star'], // Dev
      bootstrap: [
        '/dns4/ipfs.jimpick.com/tcp/9092/wss/ipfs/QmScdku7gc3VvfZZvT8kHU77bt6bnH3PnGXkyFRZ17g9EG'
      ],
      transport: {
        // maxThrottleDelayMS: 5 * 60 * 1000 // 5 minutes
        maxThrottleDelayMS: 60 * 1000 // 60 seconds
      }
    }
  }
}
