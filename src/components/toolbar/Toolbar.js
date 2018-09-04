import React from 'react'
import PropTypes from 'prop-types'
import {
  DirectoryIcon,
  SettingsIcon,
  ShortcutsIcon,
  DebugIcon
} from '../icons'
import { Button, ToggleButton } from './buttons'

const Toolbar = ({
  theme = 'light',
  docType,
  docName,
  encodedKeys,
  onDebuggingStart,
  onDebuggingStop,
  isDebuggingEnabled
}) => (
  <div className={`${theme === 'light' ? 'bg-white' : 'bg-cloud-burst'} pt1`}>
    <div className='mb3'>
      <ToggleButton theme={theme} icon={DebugIcon} title='Enable / disable debugging' onClick={isDebuggingEnabled ? onDebuggingStop : onDebuggingStart} disabled={!isDebuggingEnabled} />
    </div>
  </div>
)

Toolbar.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']),
  docType: PropTypes.oneOf(['markdown']).isRequired,
  docName: PropTypes.string.isRequired,
  encodedKeys: PropTypes.string.isRequired,
  onDirectoryClick: PropTypes.func,
  onSettingsClick: PropTypes.func,
  onShortcutsClick: PropTypes.func,
  onDebuggingStart: PropTypes.func.isRequired,
  onDebuggingStop: PropTypes.func.isRequired,
  isDebuggingEnabled: PropTypes.bool.isRequired
}

export default Toolbar
