import React, { Component } from 'react'
import PropTypes from 'prop-types'
import prettyHash from 'pretty-hash'

import config from './config'
import bindEditor from './lib/bind-editor'

import Peers from './Peers'
import Editor from './Editor'

class Edit extends Component {
  constructor (props) {
    super(props)

    const { name } = props

    this.state = {
      name: decodeURIComponent(name),
      status: 'offline',
      doc: null
    }

    this.onEditor = this.onEditor.bind(this)
  }

  onEditor (nextEditor) {
    const { doc } = this.state

    // Unbind current editor if we have a current editor and a document
    if (this._editorBinding) {
      this._editorBinding() // release binding
      this._editorBinding = null
    }

    // Save the reference to the editor so we can unbind later or so we can
    // bind if there's no doc available yet
    this._editor = nextEditor

    // Bind new editor if not null and we have a document
    if (doc && nextEditor) {
      this._editorBinding = bindEditor(doc, this._titleRef, nextEditor)
    }
  }

  render () {
    const {
      doc,
      type,
      status,
      ipfsId,
      localClock,
      appTransportRing,
      appTransportDiasSet,
      collaborationRing,
      collaborationDiasSet,
      pendingPeers,
      testingPeers,
      failedPeers,
      connections
    } = this.state

    const {
      onEditor,
      onEditorValueChange
    } = this

    const peers = <Peers
                    doc={doc}
                    ipfsId={ipfsId}
                    localClock={localClock}
                    appTransportRing={appTransportRing}
                    appTransportDiasSet={appTransportDiasSet}
                    collaborationRing={collaborationRing}
                    collaborationDiasSet={collaborationDiasSet}
                    pendingPeers={pendingPeers}
                    testingPeers={testingPeers}
                    failedPeers={failedPeers}
                    connections={connections}
                  />
    return (
      <div className="doc">
        <a href='#'>PeerPad Nano Home</a>
        <div className="status">
          <span>App: {doc ? doc.app.name : 'Loading'}</span>
          <span>Collaboration: {doc ? prettyHash(doc.name) : 'Loading'}</span>
          <span>Status: {status}</span>
        </div>
        <div className="rendezvous">
          Rendezvous: {config.peerStar.ipfs.swarm}
        </div>
        {peers}
        <Editor
          docType={type}
          onEditor={onEditor}
          onEditorValueChange={onEditorValueChange}
        />
      </div>
    )
  }

  componentDidUpdate () {
    // Force codemirror to update to help avoid render / write order issues
    if (this._editor && this._editor.refresh) {
      this._editor.refresh()
      this._editor.setOption('readOnly', false)
    }
  }

  async componentDidMount () {
    const { name } = this.state
    const PeerStar = await import('@jimpick/peer-star-app')
    const self = this

    if (!this._backend) {
      // this._backend = PeerStar('peer-star-dev', config.peerStar)
      this._backend = PeerStar('peer-star-demo-2', config.peerStar)
      this._backend.on('error', (err) => {
        console.error(err)
        window.alert(err.message)
      })
      await this._backend.start()
      const { id } = await this._backend.ipfs.id()
      this.setState({ ipfsId: id })
    }

    const options = {
      keys: {},
      samplingIntervalMS: 5000,
      maxDeltaRetention: 10,
      deltaTrimTimeoutMS: 250
    }
    const doc = await this._backend.collaborate(name, 'rga', options)
    this.setState({ doc })

    this.clockIntervalId = setInterval(() => {
      if (doc && doc._clocks && this.state.ipfsId) {
        const localClock = doc._clocks._clocks.get(this.state.ipfsId)
        const appTransport = self._backend.ipfs._libp2pNode._transport[0]
        const outerRing = appTransport._ring
        const appTransportRing = new Set(
          [...outerRing._contacts.values()]
          .map(peerInfo => peerInfo.id.toB58String())
        )
        const outerDiasSet = appTransport._diasSet(outerRing)
        const appTransportDiasSet = new Set(
          [...outerDiasSet].map(id => {
            const shortId = id.slice(4) // remove 2 preamble bytes
            const peerId = outerRing._contacts.get(shortId)
            return peerId.id.toB58String()
          })
        )
        const innerRing = doc._membership._ring
        const collaborationRing = new Set(
          [...innerRing._contacts.values()]
          .map(peerInfo => peerInfo.id.toB58String())
        )
        const innerDiasSet = doc._membership._diasSet(innerRing)
        const collaborationDiasSet = new Set(
          [...innerDiasSet].map(id => {
            const shortId = id.slice(4) // remove 2 preamble bytes
            const peerId = innerRing._contacts.get(shortId)
            return peerId.id.toB58String()
          })
        )
        const pendingPeers = new Set(
          Object.keys(appTransport.discovery._peersPending || {})
        )
        const testingPeers = new Set(
          Object.keys(appTransport.discovery._peersTesting || {})
        )
        const failedPeers = new Set(
          Object.keys(appTransport.discovery._peersFailed || {})
        )
        this.setState({
          localClock,
          appTransportRing,
          appTransportDiasSet,
          collaborationRing,
          collaborationDiasSet,
          pendingPeers,
          testingPeers,
          failedPeers
        })
      }
    }, 1000)

    doc.on('error', (err) => {
      console.log(err)
      window.alert(err.message)
    })

    doc.stats.on('peer updated', (peerId, stats) => {
      // console.log('peer %s updated its stats to:', peerId, stats)
      if (peerId === self.state.ipfsId) {
        const { connections } = stats
        self.setState({ connections })
      }
    })

    // Watch for out local ipfs node to come online.
    if (this._backend.ipfs.isOnline()) {
      this.setState({ status: 'online' })
    } else {
      this._backend.ipfs.once('started', () => {
        this.setState({ status: 'online' })
      })
    }

    await doc.start()

    this.maybeActivateEditor()
  }

  componentWillUnmount () {
    if (this.state.doc) {
      this.state.doc.stop()
    }
    if (this.clockIntervalId) {
      clearInterval(this.clockIntervalId)
    }

    this._editor = null
  }

  maybeActivateEditor () {
    if (!this._editorBinding && this._editor) {
      this._editorBinding = bindEditor(this.state.doc, this._titleRef, this._editor, this.state.type)
    }
  }
}
Edit.propTypes = {
  name: PropTypes.string,
  keys: PropTypes.string
}

export default Edit
