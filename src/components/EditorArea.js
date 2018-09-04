import React from 'react'
import Editor from './Editor'
import Toolbar from './toolbar/Toolbar'

const EditorArea = ({
  docName,
  docType,
  encodedKeys,
  viewMode,
  onEditor,
  onEditorValueChange,
  snapshots,
  onTakeSnapshot,
  onDebuggingStart,
  onDebuggingStop,
  isDebuggingEnabled
}) => {
  const editor = (
    <Editor type={docType} onEditor={onEditor} onChange={onEditorValueChange} />
  )

  const toolbar = (
    <Toolbar
      theme={viewMode === 'source' ? 'dark' : 'light'}
      docType={docType}
      docName={docName}
      encodedKeys={encodedKeys}
      snapshots={snapshots}
      onTakeSnapshot={onTakeSnapshot}
      onDebuggingStart={onDebuggingStart}
      onDebuggingStop={onDebuggingStop}
      isDebuggingEnabled={isDebuggingEnabled}
      />
  )

  // No preview for richtext, source and preview are the same thing
  if (docType === 'richtext') {
    return (
      <div className='flex-ns flex-row' style={{ minHeight: '300px' }}>
        <div className='flex-auto'>
          {editor}
        </div>
        {toolbar}
      </div>
    )
  }

  // source mode has no preview, only editor and toolbar
  return (
    <div className='flex-ns flex-row' style={{ minHeight: '300px' }}>
      <div className='flex-auto'>
        {editor}
      </div>
      {toolbar}
    </div>
  )
}

export default EditorArea
