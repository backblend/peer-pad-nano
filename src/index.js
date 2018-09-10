import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Edit from './Edit'
import CreateDocumentContainer from './CreateDocumentContainer'
import './index.css'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = { hash: location.hash }
    this.setHash = this.setHash.bind(this)
  }
  componentDidMount () {
    window.addEventListener('hashchange', this.setHash, false)
  }

  setHash () {
    this.setState({hash: location.hash})
  }

  render () {
    const { hash } = this.state
    let match = hash.match(/^#\/w\/markdown\/([^/]+)\/([^/]+)$/)
    if (match) {
      const [_, name, keys] = match
      return <Edit name={name} keys={keys} />
    } else {
      return (
        <div>
          <h1>PeerPad Nano</h1>
          <CreateDocumentContainer children={({onCreateDocument}) => (
            <button onClick={onCreateDocument}>START</button>
          )} />
        </div>
      )
    }
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
