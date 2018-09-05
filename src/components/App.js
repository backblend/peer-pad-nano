import React, { Component } from 'react'

import { HashRouter as Router, Route } from 'react-router-dom'

import Home from './Home'
import Edit from './Edit'

class App extends Component {
  render () {
    return (
      <Router>
        <div>
          <Route exact path='/' component={Home} />
          <Route exact path='/w/:type/:name/:keys' render={this.renderEditor.bind(this)} />
        </div>
      </Router>
    )
  }

  renderEditor (props) {
    return (<Edit {...props} />)
  }

}

export default App
