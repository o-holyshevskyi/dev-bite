const React = require('react');

module.exports = {
  useUniwind: () => ({
    theme: 'light',
    hasAdaptiveThemes: false,
  }),
  Uniwind: {
    setTheme: jest.fn(),
  },
};
