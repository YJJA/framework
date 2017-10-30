import React from 'react'
import PropTypes from 'prop-types'
import {matchRoutes} from 'react-router-config'
import Lazy from '../../components/Lazy'

class FrameworkContent extends React.Component {
  static propTypes = {
    className: PropTypes.string
  };

  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.object.isRequired
    }).isRequired,
    frame: PropTypes.shape({
      list: PropTypes.array.isRequired,
      setInstance: PropTypes.func.isRequired
    }).isRequired
  };

  setInstance(location, ref) {
    this.context.frame.setInstance(location, ref)
  }

  render() {
    const {className} = this.props
    const {list} = this.context.frame
    const {history} = this.context.router
    const current = list.findIndex(item => item.location.pathname === history.location.pathname)

    return (
      <div className={className}>
        {
          list.map((item, index) => {
            const {location, branch} = item
            const isActive = index === current
            const last = (branch && branch.length) ? branch[branch.length - 1] : null
            const title = last ? last.route.title : ''

            const style = {
              display: current === index ? '' : 'none'
            }

            if (!last) {
              return <div data-path={location.pathname} key={location.pathname} style={style}></div>
            }

            const {route, match} = last
            if (route.asyncComponent) {
              return (
                <div data-path={location.pathname} key={location.pathname} style={style}>
                  <Lazy load={route.asyncComponent}>
                    {Comp => <Comp ref={this.setInstance.bind(this, location)} history={history} match={match} />}
                  </Lazy>
                </div>
              )
            }

            const Comp = route.component
            return (
              <div data-path={location.pathname} key={location.pathname} style={style}>
                <Comp ref={this.setInstance.bind(this, location)} history={history} match={match} />
              </div>
            )
          })
        }
      </div>
    )
  }
}

export default FrameworkContent
