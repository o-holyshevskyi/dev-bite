const React = require('react');
const Mock = (props) => React.createElement('StatusBar', props);
Mock.displayName = 'StatusBar';
module.exports = { default: Mock };
