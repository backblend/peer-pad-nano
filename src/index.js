import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Edit from './Edit'
import CreateDocumentContainer from './CreateDocumentContainer'

class App extends Component {
  render () {
    const { hash } = location
    let match = hash.match(/^#\/w\/(markdown)\/([^/]+)\/([^/]+)$/)
    if (match) {
      match = {
        params: {
          type: match[1],
          name: match[2],
          keys: match[3]
        }
      }
      return <Edit match={match} />
    } else {
      return (
        <div>
          <h1>PeerPad Mini</h1>
          <CreateDocumentContainer children={({onCreateDocument}) => (
            <button onClick={onCreateDocument}>START</button>
          )} />
        </div>
      )
    }
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
