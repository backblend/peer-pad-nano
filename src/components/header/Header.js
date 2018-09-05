import React from 'react'
import { Link } from 'react-router-dom'

export default ({ children }) => (
  <div className='pa3 mb4'>
        <Link to='/' data-id='home-link'>PeerPad Nano Home</Link>
        {children}
  </div>
)
