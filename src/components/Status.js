import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Status extends Component {
  render () {
    return <div>Status: {this.props.status}</div>
  }
}

Status.propTypes = {
  status: PropTypes.string.isRequired
}

export default Status
