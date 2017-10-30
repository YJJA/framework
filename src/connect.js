import {connect} from 'react-redux'

export default (mapStateToProps, mapDispatchToProps, mergeProps, options) =>
  connect(mapStateToProps, mapDispatchToProps, mergeProps, {...options, withRef: true})
