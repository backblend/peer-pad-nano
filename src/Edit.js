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
      localClock
    } = this.state

    const {
      onEditor,
      onEditorValueChange
    } = this

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
        <Peers doc={doc} ipfsId={ipfsId} localClock={localClock} />
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

    if (!this._backend) {
      // this._backend = PeerStar('peer-pad-nano', config.peerStar)
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
      samplingIntervalMS: 5000
    }
    const doc = await this._backend.collaborate(name, 'rga', options)
    this.setState({ doc })

    this.clockIntervalId = setInterval(() => {
      if (doc && doc._clocks && this.state.ipfsId) {
        const localClock = doc._clocks._clocks.get(this.state.ipfsId)
        this.setState({ localClock })
      }
    }, 250)

    doc.on('error', (err) => {
      console.log(err)
      window.alert(err.message)
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
