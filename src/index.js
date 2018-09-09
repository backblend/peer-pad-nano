import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Edit from './Edit'
import CreateDocumentContainer from './CreateDocumentContainer'
import './index.css'

class App extends Component {
  render () {
    const { hash } = location
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
