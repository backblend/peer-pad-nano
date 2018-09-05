import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CodeMirror from 'codemirror'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/lib/codemirror.css'

export default class Editor extends Component {
  constructor (props) {
    super(props)
    this.onRef = this.onRef.bind(this)
  }

  onRef (ref) {
    const { onEditor, onChange } = this.props
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
        mode: 'markdown',
        readOnly: 'nocursor'
      })

      editor.on('change', () => {
        if (onChange) onChange(editor.getValue(), editor)
      })
    }

    if (onEditor) onEditor(editor)
  }

  render () {
    return <div ref={this.onRef} />
  }
}

Editor.propTypes = {
  type: PropTypes.oneOf(['markdown']),
  editable: PropTypes.bool,
  onEditor: PropTypes.func,
  onChange: PropTypes.func
}

Editor.defaultProps = {
  editable: true
}
