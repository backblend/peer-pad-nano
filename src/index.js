import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Edit from './Edit'
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
    // let match = hash.match(/^#\/([^/]+)$/)
    const match = [
      null,
      '374CoC8K9rdA1oGYEnwF4TCcsnL6McUfMj9ESc2rBRpr'
    ]
    if (match) {
      const [_, name] = match
      return <Edit name={name} />
    } else {
      return (
        <div>
          <h1>PeerPad Nano</h1>
          <button onClick={this.onCreateDocument}>START</button>
        </div>
      )
    }
  }

  async onCreateDocument () {
    const generateRandomName = await import('@jimpick/peer-star-app/src/keys/generate-random-name')
    const name = encodeURIComponent(generateRandomName())
    location.hash = `/${name}`
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
