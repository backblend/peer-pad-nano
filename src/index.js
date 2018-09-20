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
    // let match = hash.match(/^#\/w\/markdown\/([^/]+)\/([^/]+)$/)
    const match = [
      null,
      'DQ3XZjVpZc91jPjT3W1ce8sFGgAnRspgSMM31eXvH2EG',
      '4XTTM5HnZhs13rVYwuSoU9gqSRrGx8wZzGvB9HjKXP7zRbWdL-K3TgU3BvFV55pDRXJswPsNrGDEVPHx5XezYatUM6xf2vwzJC1TJXJRiMEfjCevZRmHSV3fkY3zaMjRrwWEVPRuoZYxSc1kwVzUaF54aam6oFoNqPm9y6S23AXbXVxb48pkLFEaer'
    ]
    if (match) {
      const [_, name, keys] = match
      return <Edit name={name} keys={keys} />
    } else {
      return (
        <div>
          <h1>Is PeerPad Fast Yet?</h1>

          <CreateDocumentContainer children={({onCreateDocument}) => (
            <button onClick={onCreateDocument}>START</button>
          )} />
        </div>
      )
    }
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
