import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Edit from './Edit'
import './index.css'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = { name: this.getName() }
  }

  getName () {
    const host = location.hostname
    if (host.match(/\.peer-pad-nano-dev\.jimpick\.com$/)) {
      return host.replace(/\.peer-pad-nano-dev\.jimpick\.com$/, '') // Dev
    }
    if (host.match(/\.ppn\.v6z\.me$/)) {
      return host.replace(/\.ppn\.v6z\.me$/, '') // Prod
    }
  }

  render () {
    const { name } = this.state
    if (name) {
      return <Edit name={name} />
    } else {
      return (
        <div>
          <h1>PeerPad Nano</h1>
          <div>
          <input id="doc" type="text" autoComplete="false"></input><span>.ppn.v6z.me</span>
          <button id="goBtn" onClick={this.onGo}>Go</button>
          </div>
        </div>
      )
    }
  }

  async onGo () {
    const name = document.getElementById('doc').value
    if (!name) {
      alert('Need a name!')
      return
    }
    // FIXME: Validate/encode name
    location.href = `https://${name}.${location.host}/`
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
