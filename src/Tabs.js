import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {Scrollbars} from 'react-custom-scrollbars'
import {matchRoutes} from 'react-router-config'
import Scrollbar from 'react-scrollbar'
import {Icon} from 'antd'

import 'antd/lib/popover/style/index.css'

import styles from './styles/Tabs.css'

const textOverflowEllipsis = (text, size = 5) => {
  return text && text.length > size ? text.substr(0, size - 1) + '...' : text
}

class Tabs extends Component {
  static propTypes = {
    className: PropTypes.string,
    itemWidth: PropTypes.number
  };

  static defaultProps = {
    itemWidth: 105
  };

  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.object.isRequired
    }).isRequired,
    frame: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props)

    this.state = {
      contextmenuPathname: '',
      contextmenuStyles: {
        display: 'none',
        left: 0,
        top: 0
      }
    }

    this.onContextMenu = this.onContextMenu.bind(this)
    this.onContextMenuClose = this.onContextMenuClose.bind(this)
  }

  componentDidMount() {
    this._isMounted = true

    window.addEventListener('click', this.onContextMenuClose)
    window.addEventListener('contextmenu', this.onContextMenuClose)
  }

  componentWillUnmount() {
    this._isMounted = false
    window.removeEventListener('click', this.onContextMenuClose)
    window.removeEventListener('contextmenu', this.onContextMenuClose)
  }

  focus(index) {
    const item = this.context.frame.list[index]
    const {location, branch} = item
    this.context.router.history.push(location.pathname)
  }

  remove(location) {
    this.context.frame.remove(location)
  }

  stopPropagation(e) {
    e.stopPropagation()
    e.preventDefault()
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const location = this.context.router.route.location
    const nextLocation = nextContext.router.route.location

    if (location.pathname !== nextLocation.pathname) {
      this.scrollbarTimeID && clearTimeout(this.scrollbarTimeID)
      this.scrollbarTimeID = setTimeout(() => {
        this.scrollbarScrollXTo(this.context, nextContext)
      }, 20)
    }
  }

  scrollbarScrollXTo(context, nextContext) {
    const location = context.router.route.location
    const nextLocation = nextContext.router.route.location
    const list = nextContext.frame.list
    const current = list.findIndex(({location}) => location.pathname === nextLocation.pathname)
    const {itemWidth} = this.props
    const {realWidth, containerWidth, leftPosition} = this.scrollbar.state
    const x = itemWidth * current

    // 当前 tabs 的总宽度不超过可见区域的宽度
    if (realWidth < containerWidth) {
      return
    }

    // tab 在当前可见区域内
    if ((x >= leftPosition) && (x + itemWidth) <= (leftPosition + containerWidth)) {
      return
    }

    // 计算移动最小滚动距离
    const min = x < leftPosition ? x : x + itemWidth - containerWidth
    this.scrollbar.scrollXTo(min)
  }

  setScrollbarInstance = ref => {
    this.scrollbar = ref
  }

  onContextMenu(e) {
    e.stopPropagation()
    e.preventDefault()
    const pathname = e.currentTarget.getAttribute('data-path')

    const x = e.clientX
    const y = e.clientY
    const vx = document.documentElement.clientWidth
    const vy = document.documentElement.clientHeight
    const mw = 177
    const mh = 170

    this.setState({
      contextmenuPathname: pathname,
      contextmenuStyles: {
        display: 'block',
        left: (x + mw) > vx ? (vx - mw) : x,
        top: (y + mh) > vy ? (vy - mh) : y
      }
    })
  }

  onContextMenuReload = (e) => {
    const disabled = e.currentTarget.getAttribute('disabled')
    if (disabled) {
      return
    }
    this.setState({
      contextmenuStyles: {
        display: 'none'
      }
    })
    this.context.frame.reload(this.state.contextmenuPathname)
  }

  onContextMenuRemove = (e) => {
    const disabled = e.currentTarget.getAttribute('disabled')
    if (disabled) {
      return
    }
    this.setState({
      contextmenuStyles: {
        display: 'none'
      }
    })
    this.context.frame.remove(this.state.contextmenuPathname)
  }

  onContextMenuRemoveOthers = (e) => {
    const disabled = e.currentTarget.getAttribute('disabled')
    if (disabled) {
      return
    }
    this.setState({
      contextmenuStyles: {
        display: 'none'
      }
    })
    this.context.frame.removeOthers(this.state.contextmenuPathname)
  }

  onContextMenuRemoveLefts = (e) => {
    const disabled = e.currentTarget.getAttribute('disabled')
    if (disabled) {
      return
    }
    this.setState({
      contextmenuStyles: {
        display: 'none'
      }
    })
    this.context.frame.removeLefts(this.state.contextmenuPathname)
  }

  onContextMenuRemoveRights = (e) => {
    const disabled = e.currentTarget.getAttribute('disabled')
    if (disabled) {
      return
    }
    this.setState({
      contextmenuStyles: {
        display: 'none'
      }
    })
    this.context.frame.removeRights(this.state.contextmenuPathname)
  }

  onContextMenuClose() {
    this.setState({
      contextmenuStyles: {
        display: 'none'
      }
    })
  }

  render() {
    const {className, itemWidth} = this.props
    const {list} = this.context.frame
    const {history} = this.context.router
    const {contextmenuPathname, contextStyle} = this.state
    const current = list.findIndex(({location}) => location.pathname === history.location.pathname)
    const length = list.length
    const isOnlyOne = length === 1
    const contextmenuIndex = list.findIndex(({location}) => location.pathname === contextmenuPathname)

    return (
      <div className={styles.tabs}>
        <div className={classnames(styles.wrap, className)} >
          <Scrollbar
            ref={this.setScrollbarInstance}
            swapWheelAxes
            smoothScrolling
            focusableTabIndex={2}
            contentStyle={{width: itemWidth * length}}
          >
            <div className={classnames(styles.content, 'clearfix')}
              style={{width: itemWidth * length}}>
              {
                list.map((item, index) => {
                  const {location, branch} = item
                  const isActive = index === current
                  const last = (branch && branch.length) ? branch[branch.length - 1] : null
                  const title = location.state ? location.state.title : (last ? last.route.title : '')

                  return (
                    <div key={location.pathname}
                      data-path={location.pathname}
                      onContextMenu={this.onContextMenu}
                      className={classnames(styles.item, {[styles.active]: isActive})}>
                      <span className={classnames(styles.text, {[styles.active]: isActive})}
                        title={title}
                        onClick={this.focus.bind(this, index)}>{textOverflowEllipsis(title)}</span>
                      {
                        isOnlyOne ? null : (
                          <a className={styles.close} title="关闭页面" onClick={this.remove.bind(this, location)}/>
                        )
                      }
                    </div>
                  )
                })
              }
            </div>
          </Scrollbar>
        </div>

        <div className={classnames(styles.contextmenu)}
          onClick={this.stopPropagation}
          style={this.state.contextmenuStyles}>
          <div className={styles.contextgroup}>
            <a href="javascript:;" className={styles.contextitem}
              onClick={this.onContextMenuReload}>重新加载</a>
          </div>
          <a href="javascript:;" className={styles.contextitem}
            disabled={isOnlyOne}
            onClick={this.onContextMenuRemove}>关闭标签页</a>
          <a href="javascript:;" className={styles.contextitem}
            disabled={isOnlyOne}
            onClick={this.onContextMenuRemoveOthers}>关闭其他标签页</a>
          <a href="javascript:;" className={styles.contextitem}
            disabled={isOnlyOne || contextmenuIndex === length - 1}
            onClick={this.onContextMenuRemoveRights}>关闭右侧标签页</a>
          <a href="javascript:;" className={styles.contextitem}
            disabled={isOnlyOne || contextmenuIndex === 0}
            onClick={this.onContextMenuRemoveLefts}>关闭左侧标签页</a>
        </div>
      </div>
    )
  }
}

export default Tabs
