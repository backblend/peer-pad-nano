import React, { Component } from 'react'
import cx from 'classnames'
import StartButton from './StartButton'
import styles from './Home.module.styl'

class Home extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: false
    }
  }

  render () {
    return (
      <div className={`${styles.Home} tc white`} style={{backgroundColor: '#041125'}}>
        <header className='db pv3 center' style={{maxWidth: '1260px'}}>
          <nav className='db dt-l w-100 border-box pa3 ph5-l'>

            <a className='dim db dtc-l v-btm mid-gray link w-100 w-25-l tc tl-l mb2 mb0-l' href='/' title='Home'>
              <img src='images/logo-peerpad-lg.svg' className='dib' alt='PeerPad' style={{height: '100px'}} />
            </a>

            <div className={cx('db dtc-l v-btm w-100 w-75-l tc tr-l', styles.topNav)}>

              <input id='menu-toggle' className={styles.menuToggle} type='checkbox' />
              <label htmlFor='menu-toggle' className='mt4 w-auto bg-transparent ba b--bright-turquoise bright-turquoise fw2 tracked--1 pointer dim' style={{fontSize: '15px', padding: '5px 28px'}}>Menu</label>

              <ul>
                <li>
                  <div className='db dib-ns pv3 pv0-ns'>
                    <StartButton />
                  </div>
                </li>
              </ul>

            </div>
          </nav>

        </header>
      </div>
    )
  }

  componentDidCatch (err, info) {
    this.setState({ error: err })
  }
}

export default Home
