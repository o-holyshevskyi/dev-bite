const React = require('react');

const createMock = (name) => {
  const Mock = (props) => React.createElement(name, props, props?.children);
  Mock.displayName = name;
  return Mock;
};

const CardMock = createMock('Card');
CardMock.Body = createMock('Card.Body');

const DialogMock = createMock('Dialog');
DialogMock.Portal = createMock('Dialog.Portal');
DialogMock.Overlay = createMock('Dialog.Overlay');
DialogMock.Content = createMock('Dialog.Content');

module.exports = {
  useThemeColor: (key) => {
    const colors = { foreground: '#111', background: '#fff', muted: '#666', accent: '#0a7ea4', success: '#22c55e' };
    return typeof key === 'string' ? colors[key] ?? '#000' : '#000';
  },
  Chip: createMock('Chip'),
  Card: CardMock,
  Button: createMock('Button'),
  Dialog: DialogMock,
  HeroUINativeProvider: ({ children }) => React.createElement(React.Fragment, null, children),
};
