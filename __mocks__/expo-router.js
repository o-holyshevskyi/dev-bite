const React = require('react');

const createMock = (name) => {
  const Mock = (props) => React.createElement(name, props, props?.children);
  Mock.displayName = name;
  return Mock;
};

module.exports = {
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: () => [],
  useLocalSearchParams: () => ({}),
  Link: createMock('Link'),
  Stack: Object.assign(createMock('Stack'), {
    Screen: createMock('Stack.Screen'),
  }),
};
