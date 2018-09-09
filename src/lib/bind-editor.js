import Diff from 'fast-diff'
import throttle from 'lodash.throttle'
import peerColor from './peer-color'
import functionQueue from './fn-queue'

const THROTTLE_CURSOR_ACTIVITY_MS = 100

const bindCodeMirror = (doc, titleEditor, editor) => {
  const thisPeerId = doc.app.ipfs._peerInfo.id.toB58String()
  // let cursorGossip
  // let titleCollab
  let initialised = false
  let locked = false
  let pending = false
  // let markers = new Map()
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
            // console.log('Jim delete', pos + i)
            doc.shared.removeAt(pos + i)
            pending = true
          } catch (err) {
            console.error(err)
            onStateChanged()
          }
        }
      } else { // INSERT
        // console.log('Jim insert', pos, text)
        doc.shared.insertAllAt(pos, text.split(''))
        // console.log('Jim3', doc.shared.value().join(''))
        pending = true
        pos += text.length
      }
    })
  }

  const onCodeMirrorChange = (editor) => {
    // console.log('Jim onCodeMirrorChanged')
    queue.push(() => {
      if (!initialised || locked || pending) {
        // console.log('Jim blocked', !initialised, locked, pending)
        return
      }
      editorText = editor.getValue()
      if (!editorText) return
      const diffs = Diff(doc.shared.value().join(''), editorText)
      applyDiffs(0, diffs)
      // console.log('Jim2', doc.shared.value().join(''))
    })
  }

  editor.on('change', throttle(onCodeMirrorChange, 100))
  // editor.on('change', onCodeMirrorChange)

  const onStateChanged = (fromSelf) => {
    // console.log('Jim onStateChanged', fromSelf)
    // return
    if (fromSelf) {
      pending = false
      return
    }
    // console.log('Jim onStateChanged 2')
    queue.push(() => {
      // let oldText = editor.getValue()
      let oldText = editorText
      let newText = doc.shared.value().join('')

      if (!oldText || !newText || oldText === newText) {
        pending = false
        return
      }

      locked = true

      const cursor = editor.getCursor()
      let cursorPos = editor.indexFromPos(cursor)

      const diffs = Diff(oldText, newText)
      // console.error('Jim onStateChanged diffs:')
      // diffs.forEach(diff => { console.log('  ', diff) })
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

            // moveMarkersIfAfter(pos, -text.length)
          }
        } else { // INSERT
          if (text.length) {
            const fromPos = editor.posFromIndex(pos)
            fromPos.external = true
            editor.replaceRange(text, fromPos)

            if (pos < cursorPos) {
              cursorPos += text.length
            }
            // moveMarkersIfAfter(pos, text.length)
          }
        }
      })
      editor.setCursor(editor.posFromIndex(cursorPos))

      /*
      editorText = editor.getValue()
      oldText = editorText
      newText = doc.shared.value().join('')
      */

      locked = false
      pending = false
      onCodeMirrorChange(editor)

      /*
      if (oldText !== newText) {
        onStateChanged()
      }
      */
    })
  }

  doc.on('state changed', onStateChanged)

  editor.setValue(doc.shared.value().join(''))

  /*
  const onTitleStateChanged = () => {
    const oldTitle = titleEditor.value
    const newTitle = titleCollab.shared.value().join('')
    if (newTitle === oldTitle) {
      return
    }

    titleEditor.value = newTitle
  }

  doc.sub('title', 'rga').then((_titleCollab) => {
    titleCollab = _titleCollab
    titleCollab.on('state changed', onTitleStateChanged)
    const title = titleCollab.shared.value().join('')
    titleEditor.value = title
  })

  const onTitleEditorChanged = () => {
    if (!titleCollab) {
      return
    }

    const oldTitle = titleCollab.shared.value().join('')
    const newTitle = titleEditor.value

    const diffs = Diff(oldTitle, newTitle)

    let pos = 0
    diffs.forEach((d) => {
      if (d[0] === 0) { // EQUAL
        pos += d[1].length
      } else if (d[0] === -1) { // DELETE
        const delText = d[1]
        for (let i = delText.length - 1; i >= 0; i--) {
          try {
            titleCollab.shared.removeAt(pos + i)
          } catch (err) {
            console.error(err)
            onStateChanged()
          }
        }
      } else { // INSERT
        d[1].split('').forEach((c) => {
          titleCollab.shared.insertAt(pos, c)
          pos++
        })
      }
    })
  }

  titleEditor.addEventListener('input', onTitleEditorChanged)
  */

  /*
  const onCursorGossipMessage = (cursor, fromPeerId) => {
    if (fromPeerId === thisPeerId) {
      return
    }

    const previousMarkers = markers.get(fromPeerId)
    if (previousMarkers) {
      previousMarkers.forEach((marker) => marker.clear())
    }

    const color = peerColor(fromPeerId)

    const [head, fromPos, toPos] = cursor

    const widget = getCursorWidget(head, color)

    const bookmark = editor.setBookmark(head, { widget })
    const range = editor.markText(fromPos, toPos, {
      css: `background-color: ${color}; opacity: 0.8`,
      title: fromPeerId
    })
    markers.set(fromPeerId, [bookmark, range])
  }

  doc.gossip('cursors').then((_cursorGossip) => {
    cursorGossip = _cursorGossip
    cursorGossip.on('message', onCursorGossipMessage)
  })

  const onEditorCursorActivity = () => {
    if (cursorGossip) {
      const cursor = [
        editor.getCursor('head'),
        editor.getCursor('from'),
        editor.getCursor('to')]
      cursorGossip.broadcast(cursor)
    }
  }

  const onEditorCursorActivityThrottled = throttle(onEditorCursorActivity, THROTTLE_CURSOR_ACTIVITY_MS)
  editor.on('cursorActivity', onEditorCursorActivityThrottled)
  */

  initialised = true

  return () => {
    // unbind
    doc.removeListener('state changed', onStateChanged)
    editor.off('change', onCodeMirrorChange)
    /*
    titleEditor.removeEventListener('input', onTitleEditorChanged)
    if (titleCollab) {
      titleCollab.removeListener('state changed', onTitleStateChanged)
    }
    */
    /*
    editor.off('cursorActivity', onEditorCursorActivityThrottled)
    if (cursorGossip) {
      cursorGossip.removeListener('message', onCursorGossipMessage)
    }
    */
  }

  /*
  function getCursorWidget (cursorPos, color) {
    const cursorCoords = editor.cursorCoords(cursorPos)
    const cursorElement = document.createElement('span')
    cursorElement.style.borderLeftStyle = 'solid'
    cursorElement.style.borderLeftWidth = '2px'
    cursorElement.style.borderLeftColor = color
    cursorElement.style.height = `${(cursorCoords.bottom - cursorCoords.top)}px`
    cursorElement.style.padding = 0
    cursorElement.style.zIndex = 0

    return cursorElement
  }

  function moveMarkersIfAfter (pos, diff) {
    for (let peer of markers.keys()) {
      const peerMarkers = markers.get(peer)
      moveMarkerIfAfter(peer, peerMarkers, pos, diff)
    }
  }

  function moveMarkerIfAfter (peer, peerMarkers, changePos, diff) {
    peerMarkers.forEach((marker, index) => {
      const markerPos = marker.find()
      if (markerPos) {
        const posIndex = editor.indexFromPos(markerPos)
        if (posIndex >= changePos) {
          marker.clear()
        }
      } else {
        marker.clear()
      }
    })

    markers.delete(peer)
  }
  */
}

export default (doc, title, editor) => {
  return bindCodeMirror(doc, title, editor)
}
