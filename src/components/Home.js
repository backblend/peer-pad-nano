import React, { Component } from 'react'
import CreateDocumentContainer from './CreateDocumentContainer'

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
        <CreateDocumentContainer children={({onCreateDocument}) => (
          <button onClick={onCreateDocument}>START</button>
        )} />
      </div>
    )
  }

  componentDidCatch (err, info) {
    this.setState({ error: err })
  }
}

export default Home
