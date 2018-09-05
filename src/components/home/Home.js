import React, { Component } from 'react'
import StartButton from './StartButton'

class Home extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: false
    }
  }

  render () {
    return (
      <div>
        <h1>PeerPad Mini</h1>
        <StartButton />
      </div>
    )
  }

  componentDidCatch (err, info) {
    this.setState({ error: err })
  }
}

export default Home
