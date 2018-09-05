import React, { Component } from 'react'
import PropTypes from 'prop-types'

import config from '../config'
import bindEditor from '../lib/bind-editor'
import mergeAliases from '../lib/merge-aliases'

import Peers from './Peers'
import Editor from './Editor'

const debugScope = 'peer-star:collaboration:*'

class Edit extends Component {
  constructor (props) {
    super(props)

    const { type, name, keys } = props.match.params

    this.state = {
      name: decodeURIComponent(name),
      type: type,
      documentText: '',
      status: 'offline',
      room: {},
      canEdit: keys.split('-').length >= 2,
      encodedKeys: keys,
      viewMode: 'source',
      alias: window.localStorage.getItem('alias'),
      doc: null,
      isDebuggingEnabled: !!window.localStorage.getItem('debug')
    }

    this.onViewModeChange = this.onViewModeChange.bind(this)
    this.onEditor = this.onEditor.bind(this)
    this.onEditorValueChange = this.onEditorValueChange.bind(this)
    this.onAliasChange = this.onAliasChange.bind(this)
    this.onDebuggingStart = this.onDebuggingStart.bind(this)
    this.onDebuggingStop = this.onDebuggingStop.bind(this)
  }

  onViewModeChange (viewMode) {
    this.setState({ viewMode })
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
      this._editorBinding = bindEditor(doc, this._titleRef, nextEditor, this.state.type)
    }
  }

  onEditorValueChange (documentText) {
    this.setState({ documentText })
  }

  async onAliasChange (alias) {
    this.setState({ alias })
    const doc = this.state.doc
    // cache globally for other pads to be able to use
    window.localStorage.setItem('alias', alias)
    const aliasesCollab = await doc.sub('aliases', 'mvreg')
    let aliases = mergeAliases(aliasesCollab.shared.value())
    const myPeerId = (await doc.app.ipfs.id()).id
    aliases[myPeerId] = alias
    aliasesCollab.shared.write(aliases)
  }

  async onDebuggingStart () {
    (await import('peer-star-app')).debug.enable(debugScope)
    localStorage.setItem('debug', debugScope)
    console.log('debugging started')
    this.setState({isDebuggingEnabled: true})
  }

  async onDebuggingStop () {
    (await import('peer-star-app')).debug.disable()
    localStorage.setItem('debug', '')
    console.log('debugging stopped')
    this.setState({isDebuggingEnabled: false})
  }

  render () {
    const {
      type,
      status,
      canEdit,
      alias
    } = this.state

    const {
      onEditor,
      onEditorValueChange
    } = this

    return (
      <div>
        <a href='/'>PeerPad Nano Home</a>
        <div>Status: {status}</div>
        <Peers doc={this.state.doc} alias={alias} onAliasChange={this.onAliasChange} canEdit={this.state.canEdit} />
        <input
          ref={(ref) => { this._titleRef = ref }}
          type='text'
          placeholder='Document Title'
          readOnly={!canEdit}
          data-id='document-title-input'
          />
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
      this._editor.setOption('readOnly', !this.state.canEdit)
    }
  }

  async componentDidMount () {
    const PeerStar = await import('peer-star-app')

    if (!this._backend) {
      this._backend = PeerStar('peer-pad/2', config.peerStar)
      this._backend.on('error', (err) => {
        console.error(err)
        window.alert(err.message)
      })
      await this._backend.start()
    }

    const keys = await PeerStar.keys.uriDecode(this.state.encodedKeys)

    const doc = await this._backend.collaborate(
      this.state.name,
      'rga',
      {
        keys,
        maxDeltaRetention: 0
      })

    this.setState({ doc })

    doc.on('error', (err) => {
      console.log(err)
      window.alert(err.message)
    })

    // Watch for out local ipfs node to come online.
    if (this._backend.ipfs.isOnline()) {
      this.setState({ status: 'online' })
    } else {
      this._backend.ipfs.once('started', () => {
        this.onDebuggingStart() // activate debugging
        this.setState({ status: 'online' })
      })
    }

    await doc.start()

    this.maybeActivateEditor()

    // Bind the editor if we got an instance while the doc was starting

    // TODO: bind the editor to the document
    // if (this._editor) doc.bindEditor(this._editor)

    // Turn the doc title into a peer editable input.
  }

  componentWillUnmount () {
    if (this.state.doc) {
      this.state.doc.stop()
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
  type: PropTypes.object
}

export default Edit
