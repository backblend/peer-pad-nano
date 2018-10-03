import Diff from 'fast-diff'
import throttle from 'lodash.throttle'
import functionQueue from './fn-queue'

const bindCodeMirror = (doc, titleEditor, editor) => {
  let initialised = false
  let locked = false
  let pending = false
  let queue = functionQueue()
  let editorText

  const applyDiffs = (pos, diffs) => {
    diffs.forEach((d) => {
      const [op, text] = d
      if (op === 0) { // EQUAL
        pos += text.length
      } else if (op === -1) { // DELETE
        for (let i = text.length - 1; i >= 0; i--) {
          try {
            doc.shared.removeAt(pos + i)
            pending = true
          } catch (err) {
            console.error(err)
            onStateChanged()
          }
        }
      } else { // INSERT
        doc.shared.insertAllAt(pos, text.split(''))
        pending = true
        pos += text.length
      }
    })
  }

  const onCodeMirrorChange = (editor) => {
    queue.push(() => {
      // pending = our changes haven't showed up in the CRDT yet
      // locked = editor is being updated with CRDT changes
      if (!initialised || locked || pending) {
        return
      }
      editorText = editor.getValue()
      const diffs = Diff(doc.shared.value().join(''), editorText)
      applyDiffs(0, diffs)
    })
  }

  editor.on('change', throttle(onCodeMirrorChange, 100))

  const onStateChanged = (fromSelf) => {
    if (fromSelf) {
      pending = false
      return
    }
    queue.push(() => {
      let oldText = editorText || ''
      let newText = doc.shared.value().join('')

      if (oldText === newText) {
        pending = false
        onCodeMirrorChange(editor)
        return
      }

      locked = true

      const cursor = editor.getCursor()
      let cursorPos = editor.indexFromPos(cursor)

      const diffs = Diff(oldText, newText)
      let pos = 0
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
      pending = false
      onCodeMirrorChange(editor)
    })
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
