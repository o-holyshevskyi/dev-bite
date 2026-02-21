const React = require('react');

const Mock = (props) => React.createElement('GestureHandlerRootView', props, props?.children);
Mock.displayName = 'GestureHandlerRootView';

module.exports = {
  GestureHandlerRootView: Mock,
};
