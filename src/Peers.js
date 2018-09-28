import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import peerColor from './lib/peer-color'
// import mergeAliases from './lib/merge-aliases'

export default class Peers extends Component {
  constructor (props) {
    super(props)

    const initialState = {
      peers: (props.doc && props.doc.peers()) || {},
      dropdownOpen: false
    }

    this.state = initialState

    this.onPeersChange = this.onPeersChange.bind(this)

    if (props.doc) {
      props.doc.on('membership changed', this.onPeersChange)
    }
  }

  async componentWillReceiveProps (nextProps) {
    // Remove listener if receiving new peers object
    if (nextProps.doc && this.props.doc) {
      this.props.doc.removeListener('membership changed', this.onPeersChange)
      nextProps.doc.on('membership changed', this.onPeersChange)
      this.setState({ peers: nextProps.doc.peers() })
    }
  }

  componentWillUnmount () {
    if (this.props.peerGroup) {
      this.props.peerGroup.removeListener('change', this.onPeersChange)
    }
  }

  onPeersChange () {
    this.setState({ peers: this.props.doc.peers() })
  }

  render () {
    const { peers } = this.state
    const {
      ipfsId,
      localClock,
      appTransportRing,
      appTransportDiasSet,
      collaborationRing,
      connections
    } = this.props

    if (!ipfsId) return <p>No peers</p>
    if (!appTransportRing) return<p>Loading...</p>
    const peersAndClockPeers = localClock
      ? new Set([
          ...peers,
          ...Object.keys(localClock),
          ...appTransportRing,
          ...collaborationRing
        ])
      : peers
    const peerIdsSeen = Array
      .from(peersAndClockPeers)
      .filter(peerId => collaborationRing.has(peerId) || peerId === ipfsId)
      .sort()
    const peerIdsOther = Array
      .from(peersAndClockPeers)
      .filter(peerId => appTransportRing.has(peerId) &&
                        !collaborationRing.has(peerId) &&
                        peerId !== ipfsId
      )
      .sort()
    const peerIdsAway = Array
      .from(peersAndClockPeers)
      .filter(peerId => !appTransportRing.has(peerId) &&
                        !collaborationRing.has(peerId) &&
                        peerId !== ipfsId
      )
      .sort()
    return (
      <div className="peers">
        Seen: <ul>
          {peerIdsSeen.map((id) => (
            <PeerItem
              key={id}
              id={id}
              clock={localClock && localClock[id]}
              local={id === ipfsId}
              connections={connections}
              inAppTransportDiasSet={appTransportDiasSet.has(id)}
            />
          ))}
        </ul><br/>
        Other: <ul>
          {peerIdsOther.map((id) => (
            <PeerItem
              key={id}
              id={id}
              clock={localClock && localClock[id]}
              local={id === ipfsId}
              connections={connections}
              inAppTransportDiasSet={appTransportDiasSet.has(id)}
            />
          ))}
        </ul><br/>
        Away: <ul>
          {peerIdsAway.map((id) => (
            <PeerItem
              key={id}
              id={id}
              clock={localClock && localClock[id]}
              local={id === ipfsId}
              connections={connections}
              inAppTransportDiasSet={appTransportDiasSet.has(id)}
            />
          ))}
        </ul>
      </div>
    )
  }
}

Peers.propTypes = {
  doc: PropTypes.object,
  ipfsId: PropTypes.string,
  localClock: PropTypes.object,
  appTransportRing: PropTypes.object,
  appTransportDiasSet: PropTypes.object,
  collaborationRing: PropTypes.object,
  connections: PropTypes.object
}

const PeerItem = ({
  id,
  clock,
  local,
  connections,
  inAppTransportDiasSet
}) => {
  let borderStyle = 'none'
  if (!local) {
    if (
      connections &&
      connections.inbound.has(id) &&
      connections.outbound.has(id)
    ) {
      borderStyle = 'solid'
    } else if (
      connections &&
      (connections.inbound.has(id) ||
       connections.outbound.has(id))
    ) {
      borderStyle = 'dashed'
    } else {
      borderStyle = 'dotted'
    }
  }
  const style = {
    borderBottom: `2px ${borderStyle} ${peerColor(id)}`
  }
  return (
    <li className={classNames({local, inAppTransportDiasSet})}>
      <span style={style}>
        {id.slice(id.length - 3)}
      </span>
      {clock && <span>{' '}{clock}</span>}
    </li>
  )
}
