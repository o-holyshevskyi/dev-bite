const React = require('react');

const createMock = (name) => {
  const Mock = (props) => React.createElement(name, props, props?.children);
  Mock.displayName = name;
  return Mock;
};

module.exports = {
  default: createMock('Animated.View'),
  useSharedValue: (init) => ({ value: init }),
  useAnimatedStyle: (fn) => ({}),
  useAnimatedScrollHandler: () => jest.fn(),
  useAnimatedReaction: () => {},
  withTiming: (v) => v,
  withSpring: (v) => v,
  withSequence: (...args) => args[0],
  runOnJS: (fn) => fn,
  FadeInDown: createMock('FadeInDown'),
  interpolate: (value) => value,
  Extrapolation: { CLAMP: 'clamp' },
};
