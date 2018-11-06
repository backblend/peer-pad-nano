import Diff from 'fast-diff'

const bindCodeMirror = (doc, titleEditor, editor) => {
  let initialised = false
  let locked = false
  let editorValueCache

  const getEditorValue = () => {
    if (!editorValueCache) {
      editorValueCache = editor.getValue()
    }
    return editorValueCache
  }

  const applyDiffs = (pos, diffs) => {
    diffs.forEach((d) => {
      const [op, text] = d
      if (op === 0) { // EQUAL
        pos += text.length
      } else if (op === -1) { // DELETE
        for (let i = text.length - 1; i >= 0; i--) {
          try {
            doc.shared.removeAt(pos + i)
          } catch (err) {
            console.error(err)
            onStateChanged()
          }
        }
      } else { // INSERT
        doc.shared.insertAllAt(pos, text.split(''))
        pos += text.length
      }
    })
  }

  const onCodeMirrorChange = (editor) => {
    editorValueCache = undefined
    if (!initialised || locked) {
      return
    }
    const diffs = Diff(doc.shared.value().join(''), getEditorValue())
    applyDiffs(0, diffs)
  }

  editor.on('change', onCodeMirrorChange)

  const onStateChanged = () => {
    let oldText = getEditorValue()
    let newText = doc.shared.value().join('')

    if (oldText === newText) {
      return
    }

    locked = true

    const cursor = editor.getCursor()
    let cursorPos = editor.indexFromPos(cursor)

    const diffs = Diff(oldText, newText)
    let pos = 0
    editorValueCache = undefined

    diffs.forEach((d) => {
      const [op, text] = d
      if (op === 0) { // EQUAL
        pos += text.length
      } else if (op === -1) { // DELETE
        if (text.length) {
          const fromPos = editor.posFromIndex(pos)
          fromPos.external = true
          const toPos = editor.posFromIndex(pos + text.length)
          toPos.external = true
          editor.replaceRange('', fromPos, toPos)

          if (pos < cursorPos) {
            cursorPos -= text.length
          }
        }
      } else { // INSERT
        if (text.length) {
          const fromPos = editor.posFromIndex(pos)
          fromPos.external = true
          editor.replaceRange(text, fromPos)

          if (pos < cursorPos) {
            cursorPos += text.length
          }
          pos += text.length
        }
      }
    })
    editor.setCursor(editor.posFromIndex(cursorPos))

    locked = false
  }

  doc.on('state changed', onStateChanged)

  editor.setValue(doc.shared.value().join(''))

  initialised = true

  return () => {
    // unbind
    doc.removeListener('state changed', onStateChanged)
    editor.off('change', onCodeMirrorChange)
  }
}

export default (doc, title, editor) => {
  return bindCodeMirror(doc, title, editor)
}
