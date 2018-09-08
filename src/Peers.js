import React, { Component } from 'react'
import PropTypes from 'prop-types'
import peerColor from './lib/peer-color'
// import mergeAliases from './lib/merge-aliases'

export default class Peers extends Component {
  constructor (props) {
    super(props)

    const initialState = {
      peers: (props.doc && props.doc.peers()) || {},
      dropdownOpen: false,
      // alias: props.alias || ''
    }

    this.state = initialState

    this.onPeersChange = this.onPeersChange.bind(this)
    /*
    this.onAliasChange = this.onAliasChange.bind(this)
    this.onSaveAlias = this.onSaveAlias.bind(this)
    this.onAliasesStateChanged = this.onAliasesStateChanged.bind(this)
    */

    if (props.doc) {
      props.doc.on('membership changed', this.onPeersChange)
      // this.bindAliases()
    }
  }

  async componentWillReceiveProps (nextProps) {
    // Remove listener if receiving new peers object
    if (nextProps.doc && this.props.doc) {
      this.props.doc.removeListener('membership changed', this.onPeersChange)
      // await this.unbindAliases()
      nextProps.doc.on('membership changed', this.onPeersChange)
      this.setState({ peers: nextProps.doc.peers() })
      // this.bindAliases(nextProps.doc)
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

  /*
  onAliasesStateChanged () {
    this.props.doc.sub('aliases', 'mvreg')
      .then((aliasesCollab) => {
        const aliases = mergeAliases(aliasesCollab.shared.value())
        this.setState({ aliases })
      })
  }

  unbindAliases () {
    return this.props.doc.sub('aliases', 'mvreg')
      .then((aliasesCollab) => {
        aliasesCollab.removeListener('state changed', this.onAliasesStateChanged)
      })
  }

  bindAliases (doc) {
    if (!doc) {
      doc = this.props.doc
    }
    doc.sub('aliases', 'mvreg')
      .then((aliasesCollab) => {
        const aliases = mergeAliases(aliasesCollab.shared.value())
        this.setState({ aliases })
        aliasesCollab.on('state changed', this.onAliasesStateChanged)
      })
      .catch((err) => {
        console.error('error in aliases collaboration:', err)
      })
  }

  onAliasChange (ev) {
    const alias = ev.target.value
    this.setState({ alias })
  }

  onSaveAlias () {
    const { alias } = this.state
    this.props.onAliasChange(alias)
  }
  */

  render () {
    // const { peers, alias } = this.state
    const { peers } = this.state
    const peerIds = Array.from(peers).sort()
    const count = peerIds.length - 1
    //            alias={(this.state.aliases && this.state.aliases[id]) || ''}
    return (
      <div className='pa3'>
        {count >= 0 ? (
          <ul className='ma0 pa0'>
            {peerIds.map((id, i) => (
              <PeerItem
                key={id}
                id={id}
                last={i === count - 1} />
            ))}
          </ul>
        ) : (
          <p className='f6 ma0'>No other peers</p>
        )}
        {
          /*
          this.props.canEdit ? (
            <div className='f6 ma0 pa0'>
              <input type='text' value={alias} placeholder='Your name' onChange={this.onAliasChange} />
              <button type='button' onClick={this.onSaveAlias}>SET</button>
            </div>
          ) : null
          */
        }
      </div>
    )
  }
}

Peers.propTypes = {
  doc: PropTypes.object,
  // alias: PropTypes.string,
  // onAliasChange: PropTypes.func
}

const PeerItem = ({ id, alias, last }) => {
  let aliasElem = (alias ? <span>{alias}</span> : '')
  if (!aliasElem) {
    aliasElem = id
  }
  return (
    <li>
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          borderBottom: `3px solid ${peerColor(id)}`
        }}
        title={alias || id}>
        {aliasElem}
      </span>
    </li>
  )
}
