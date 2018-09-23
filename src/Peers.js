import React, { Component } from 'react'
import PropTypes from 'prop-types'
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
    const { ipfsId, localClock } = this.props

    if (!ipfsId) return <p>No peers</p>
    const peersAndClockPeers = localClock
      ? new Set([...peers, ...Object.keys(localClock)])
      : peers
    const peerIds = Array
      .from(peersAndClockPeers)
      .sort()
    return (
      <div className="peers">
        <ul>
          {peerIds.map((id) => (
            <PeerItem
              key={id}
              id={id}
              clock={localClock && localClock[id]}
              connected={peers.has(id)}
              local={id === ipfsId}
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
  localClock: PropTypes.object
}

const PeerItem = ({ id, clock, connected, local }) => {
  const style = {
    borderBottom: `3px ${connected ? 'solid' : 'dotted'} ${peerColor(id)}`
  }
  return (
    <li className={local ? 'local' : ''}>
      <span style={style}>
        {id.slice(id.length - 3)}
      </span>
      {clock}
    </li>
  )
}