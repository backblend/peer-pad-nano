import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'

export default class Editor extends Component {
  constructor (props) {
    super(props)
    this.onRef = this.onRef.bind(this)
  }

  shouldComponentUpdate () {
    return false
  }

  onRef (ref) {
    const { onEditor } = this.props
    let editor

    if (ref) {
      // See: http://codemirror.net/doc/manual.html#config
      editor = CodeMirror(ref, {
        autofocus: true,
        inputStyle: 'contenteditable',
        lineNumbers: true,
        value: '',
        viewportMargin: Infinity,
        lineWrapping: true,
        readOnly: 'nocursor'
      })
    }

    if (onEditor) onEditor(editor)
  }

  render () {
    return <div ref={this.onRef} className="editor"/>
  }
}

Editor.propTypes = {
  onEditor: PropTypes.func
}
