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
    const { ipfsId } = this.props
    const peerIds = Array.from(peers).sort()
    const count = peerIds.length - 1
    return (
      <div className="peers">
        {count >= 0 ? (
          <ul>
            {peerIds.map((id) => {
              if (id === ipfsId) {
                // List self first in list
                return (<PeerItem
                  key={id}
                  id={id}
                />)
              }
            })}
            {peerIds.map((id) => {
              if (id !== ipfsId) {
                // List all others
                return (<PeerItem
                  key={id}
                  id={id}
                />)
              }
            })}
          </ul>
        ) : (
          <p>No peers</p>
        )}
      </div>
    )
  }
}

Peers.propTypes = {
  doc: PropTypes.object,
  ipfsId: PropTypes.string
}

const PeerItem = ({ id }) => {
  return (
    <li>
      <span style={{borderBottom: `3px solid ${peerColor(id)}`}}>
        {id.slice(id.length - 3)}
      </span>
    </li>
  )
}
