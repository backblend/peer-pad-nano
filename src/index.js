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
      'CBk41tXvL2e4E2VxMF7SduUt9PA238XFVmzU6UKYGZni',
      '4XTTMGwp3xtibjdVPcr5je7tc3YYmgqpe23XqjxZrELjF1Hwh-K3TgUKU7d6mDPxtqetw3THj4sWtDx7FwFY3BpMuSTFQHjxGsG8LKnhd1YXHdeXfAtqZ3BGskkTNwdbxnPdcc2hEvsgjBSVHnNUqwR5EZWetheTo4PHDd714vFkFLtvBJq2gGdXab'
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
