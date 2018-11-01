import Diff from 'fast-diff'
import throttle from 'lodash.throttle'
import functionQueue from './fn-queue'

const bindCodeMirror = (doc, titleEditor, editor) => {
  let initialised = false
  let locked = false
  let pending = false
  let queue = functionQueue()
  let editorText
  let committedText

  const applyDiffs = (pos, diffs, editorText) => {
    // console.log('Jim applyDiffs start')
    // const transaction = CRDT('rga')('t')
    // transaction.apply(doc.shared.state())
    // const deltas = []
    diffs.forEach((d) => {
      const [op, text] = d
      if (op === 0) { // EQUAL
        pos += text.length
      } else if (op === -1) { // DELETE
        for (let i = text.length - 1; i >= 0; i--) {
          try {
            // deltas.push(transaction.removeAt(pos + i))
            /*
            console.log('%cJim bind-editor removeAt',
              'color: white; background: black', pos + i)
            */
            doc.shared.removeAt(pos + i)
            pending = true
          } catch (err) {
            console.error(err)
          }
        }
      } else { // INSERT
        // deltas.push(transaction.insertAllAt(pos, text.split('')))
        doc.shared.insertAllAt(pos, text.split(''))
        /*
        console.log('%cJim bind-editor insertAllAt',
          'color: white; background: black', pos, text)
        */
        pending = true
        pos += text.length
      }
    })
    // FIXME: Faster if applying only joined deltas?
    // doc.shared.apply(transaction.state())
    let newText = doc.shared.value().join('')
    // console.log('Jim applyDiffs done\n', newText)
    if (newText !== editorText) {
      console.error('Mismatch!!!!!!!!!!!!!!!!')
    }
    committedText = newText
    pending = false
    // onStateChanged()
  }

  const onCodeMirrorChange = (editor) => {
    queue.push(() => {
      // pending = our changes haven't showed up in the CRDT yet
      // locked = editor is being updated with CRDT changes
      if (!initialised || locked || pending) {
        return
      }
      editorText = editor.getValue()
      /*
      console.log('Jim codemirror changed, update CRDT to match codemirror')
      console.log('Jim editorText\n', editorText)
      */
      const crdtText = doc.shared.value().join('')
      // console.log('Jim CRDT text\n', crdtText)
      const diffs = Diff(crdtText, editorText)
      // console.log('Jim diffs', diffs)

      /*
      console.log('Assertion')
      const state = doc.shared.state()
      const addedVertices = [...state[0]]
      for (let av of addedVertices) {
        console.log('av', av)
      }
      */

      applyDiffs(0, diffs, editorText)
    })
  }

  editor.on('change', () => {
    // console.log('codemirror change event', locked)
    if (locked) return
    throttledOnCodeMirrorChange(editor)
  })

  const throttledOnCodeMirrorChange = throttle(onCodeMirrorChange, 100)

  const onStateChanged = (fromSelf) => {
    if (fromSelf) {
      // pending = false
      return
    }
    queue.push(() => {
      editorText = editor.getValue()
      let oldText = editorText || ''
      let newText = doc.shared.value().join('')

      if (oldText === newText || committedText === newText || pending) {
        pending = false
        // onCodeMirrorChange(editor)
        return
      }

      locked = true
      /*
      console.log('Jim CRDT changed, update codemirror to match')
      console.log('Jim pending', pending)
      console.log('Jim oldText\n', oldText)
      const editorText2 = editor.getValue()
      console.log('Jim editorText\n', editorText2)
      console.log('Jim CRDT text\n', doc.shared.value().join(''))
      */

      /*
      console.log('Assertion')
      const state = doc.shared.state()
      const addedVertices = [...state[0]]
      for (let av of addedVertices) {
        console.log('av', av)
      }
      */

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
      /*
      const editorText3 = editor.getValue()
      console.log('Jim final editorText3\n', editorText3)
      */

      locked = false
      pending = false
      // onCodeMirrorChange(editor)
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
