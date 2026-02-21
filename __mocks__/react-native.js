const React = require('react');

const createMock = (name) => {
  const Mock = (props) => React.createElement(name, props, props?.children);
  Mock.displayName = name;
  return Mock;
};

module.exports = {
  View: createMock('View'),
  Text: createMock('Text'),
  ScrollView: createMock('ScrollView'),
  Pressable: createMock('Pressable'),
  TouchableOpacity: createMock('TouchableOpacity'),
  StyleSheet: {
    create: (styles) => styles,
  },
  useWindowDimensions: () => ({ width: 390, height: 844 }),
  useColorScheme: () => 'light',
  Dimensions: {
    get: () => ({ width: 390, height: 844 }),
  },
  AppState: {
    addEventListener: () => ({ remove: jest.fn() }),
  },
};
