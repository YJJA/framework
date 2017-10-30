import React, {Component} from 'react'
import PropTypes from 'prop-types'
import createHistory from 'history/createBrowserHistory'
import {Router} from 'react-router'
import {matchRoutes} from 'react-router-config'

class FrameRouter extends Component {
  static propTypes = {
    basename: PropTypes.string,
    forceRefresh: PropTypes.bool,
    getUserConfirmation: PropTypes.func,
    keyLength: PropTypes.number,
    children: PropTypes.node
  };

  static childContextTypes = {
    frame: PropTypes.object.isRequired
  };

  getChildContext() {
    return {
      frame: {
        routes: this.props.routes,
        list: this.state.list,
        setInstance: this.setInstance,
        reload: this.reload,
        remove: this.remove,
        removeOthers: this.removeOthers,
        removeLefts: this.removeLefts,
        removeRights: this.removeRights
      }
    }
  }

  constructor(props) {
    super(props)

    this.state = {list: []}
    this._instance = {}
    const {routes, ...historyProps} = this.props
    this.history = createHistory(historyProps)
  }

  componentDidMount() {
    this.push(this.history.location)
    this.history.listen((location, action) => {
      this.push(location)
    })
  }

  push(location) {
    location = typeof location === 'string' ? {pathname: location} : location
    const stateList = this.state.list
    const index = stateList.findIndex(item => item.location.pathname === location.pathname)
    const branch = matchRoutes(this.props.routes, location.pathname)
    let list = []

    if (!~index) {
      // push
      list = [...stateList, {location, branch}]
    } else {
      // focus
      this.reload()
      list = [...stateList]
    }

    this.setState({list})
  }

  remove = (location) => {
    location = typeof location === 'string' ? {pathname: location} : location
    if (this.state.list.length === 1) {
      return
    }
    const isCurrent = location.pathname === this.history.location.pathname
    const index = this.state.list.findIndex(item => item.location.pathname === location.pathname)
    if (!~index) {
      return
    }

    const list = [
      ...this.state.list.slice(0, index),
      ...this.state.list.slice(index + 1, this.state.list.length)
    ]

    if (isCurrent) {
      const current = index - 1 < 0 ? 1 : index - 1
      const item = list[current]
      this.history.push(item.location.pathname)
    }
    this.setState({list})
  }

  removeOthers = (location) => {
    location = typeof location === 'string' ? {pathname: location} : location
    const index = this.state.list.findIndex(item => item.location.pathname === location.pathname)
    if (!~index) {
      return
    }
    const item = this.state.list[index]
    const list = [item]
    this.history.push(item.location.pathname)
    this.setState({list})
  }

  removeLefts = (location) => {
    location = typeof location === 'string' ? {pathname: location} : location
    const index = this.state.list.findIndex(item => item.location.pathname === location.pathname)
    if (!~index) {
      return
    }
    const list = [
      ...this.state.list.slice(index, this.state.list.length)
    ]
    const currentLocation = this.history.location
    const currentIndex = list.findIndex(item => {
      return item.location.pathname === currentLocation.pathname
    })
    if (!~currentIndex) {
      const item = list[0]
      this.history.push(item.location.pathname)
    }
    this.setState({list})
  }

  removeRights = (location) => {
    location = typeof location === 'string' ? {pathname: location} : location
    const index = this.state.list.findIndex(item => item.location.pathname === location.pathname)
    if (!~index) {
      return
    }
    const list = [
      ...this.state.list.slice(0, index + 1)
    ]
    const currentLocation = this.history.location
    const currentIndex = list.findIndex(item => {
      return item.location.pathname === currentLocation.pathname
    })
    if (!~currentIndex) {
      const item = list[list.length - 1]
      this.history.push(item.location.pathname)
    }
    this.setState({list})
  }

  reload = (location = this.history.location) => {
    location = typeof location === 'string' ? {pathname: location} : location
    let ref = this._instance[location.pathname]
    ref = (ref && ref.wrappedInstance) ? ref.wrappedInstance : ref
    if (!ref || !ref.componentReload) {
      return
    }

    ref.componentReload()
  }

  setInstance = (location, ref) => {
    this._instance[location.pathname] = ref
  }

  render() {
    return <Router history={this.history} children={this.props.children}/>
  }
}

export default FrameRouter
