import React, { Component } from 'react'

import Home from './Home'
import Edit from './Edit'

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
      // return <pre>{JSON.stringify(match)}</pre>
    } else {
      return <Home />
    }
  }
}

export default App
