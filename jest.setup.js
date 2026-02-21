// Mock AsyncStorage so store can load
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  },
}));

// Mock expo-notifications (ESM) so notifications.ts and store can load
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ granted: false })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: false })),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve()),
  SchedulableTriggerInputTypes: { DATE: 'date', DAILY: 'daily' },
}));

// Component test mocks (no-op for unit-only tests) - use inline factories to avoid circular require
jest.mock('react-native', () => {
  const React = require('react');
  const createHost = (tag) => {
    const C = (props) => {
      const { children, testID, ...rest } = props || {};
      return React.createElement(tag, { ...rest, testID, 'data-testid': testID }, children);
    };
    C.displayName = tag;
    return C;
  };
  const createMock = (tag) => {
    const C = (props) => React.createElement(tag, props, props?.children);
    C.displayName = tag;
    return C;
  };
  return {
    View: createHost('div'),
    Text: createHost('span'),
    TextInput: createHost('input'),
    Image: createHost('img'),
    Switch: createHost('input'),
    Modal: createHost('div'),
    ScrollView: createHost('div'),
    Pressable: createHost('button'),
    TouchableOpacity: createHost('button'),
    StyleSheet: {
      create: (s) => s,
      flatten: (style) => (Array.isArray(style) ? Object.assign({}, ...(style || []).filter(Boolean)) : style || {}),
    },
    useWindowDimensions: () => ({ width: 390, height: 844 }),
    useColorScheme: () => 'light',
    Dimensions: { get: () => ({ width: 390, height: 844 }) },
    AppState: { addEventListener: () => ({ remove: jest.fn() }) },
    Platform: {
      select: (obj) => obj.default ?? obj.ios ?? obj.android ?? Object.values(obj)[0],
      OS: 'ios',
    },
  };
});
jest.mock('heroui-native', () => {
  const React = require('react');
  const createHost = (tag) => {
    const C = (props) => {
      const { children, testID, ...rest } = props || {};
      return React.createElement(tag, { ...rest, testID, 'data-testid': testID }, children);
    };
    C.displayName = tag;
    return C;
  };
  const createMock = (name) => {
    const C = (props) => React.createElement('div', { 'data-testid': name }, props?.children);
    C.displayName = name;
    return C;
  };
  const CardMock = createHost('div');
  CardMock.Body = createHost('div');
  const DialogMock = createHost('div');
  DialogMock.Portal = createHost('div');
  DialogMock.Overlay = createHost('div');
  DialogMock.Content = createHost('div');
  const ButtonMock = createHost('button');
  ButtonMock.Label = createHost('span');
  return {
    useThemeColor: (key) => ({ foreground: '#111', background: '#fff', muted: '#666', accent: '#0a7ea4', success: '#22c55e' }[key] ?? '#000'),
    Chip: createHost('div'),
    Card: CardMock,
    Button: ButtonMock,
    Dialog: DialogMock,
    HeroUINativeProvider: ({ children }) => children,
  };
});
jest.mock('uniwind', () => ({
  useUniwind: () => ({ theme: 'light', hasAdaptiveThemes: false }),
  Uniwind: { setTheme: jest.fn() },
}));
jest.mock('expo-router', () => {
  const React = require('react');
  const LinkMock = (props) => {
    const { children, href, testID, ...rest } = props || {};
    return React.createElement('a', { ...rest, href, testID, 'data-testid': testID }, React.createElement('span', {}, children));
  };
  return {
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useSegments: () => [],
    useLocalSearchParams: () => ({}),
    Link: LinkMock,
    Stack: Object.assign((props) => React.createElement('Stack', props, props?.children), { Screen: (props) => React.createElement('Stack.Screen', props) }),
  };
});
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const createHost = (tag) => {
    const C = (props) => {
      const { children, testID, ...rest } = props || {};
      return React.createElement(tag, { ...rest, testID, 'data-testid': testID }, children);
    };
    return C;
  };
  const AnimatedView = createHost('div');
  const AnimatedText = createHost('span');
  const Animated = { View: AnimatedView, Text: AnimatedText };
  return {
    default: Animated,
    useSharedValue: (v) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    useAnimatedScrollHandler: () => jest.fn(),
    useAnimatedReaction: () => {},
    withTiming: (v) => v,
    withSpring: (v) => v,
    withSequence: (...a) => a[0],
    runOnJS: (fn) => fn,
    FadeInDown: AnimatedView,
    interpolate: (v) => v,
    Extrapolation: { CLAMP: 'clamp' },
  };
});
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }) => children,
}));
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  return { GestureHandlerRootView: (props) => React.createElement('GestureHandlerRootView', props, props?.children) };
});
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 0, Warning: 1, Error: 2 },
}));
jest.mock('expo-status-bar', () => {
  const React = require('react');
  return { default: (props) => React.createElement('StatusBar', props) };
});
jest.mock('@react-navigation/native', () => ({
  ThemeProvider: ({ children }) => children,
  DarkTheme: {},
  DefaultTheme: {},
}));
jest.mock('expo-router/unstable-native-tabs', () => {
  const React = require('react');
  return {
    Icon: () => null,
    Label: ({ children }) => React.createElement('span', {}, children),
    NativeTabs: Object.assign(({ children }) => React.createElement('div', { 'data-testid': 'native-tabs' }, children), { Trigger: ({ children }) => React.createElement('div', {}, children) }),
  };
});
jest.mock('@/components/ui/icon-symbol', () => {
  const React = require('react');
  return { IconSymbol: (props) => React.createElement('span', {}, props?.name ?? '') };
});
jest.mock('@/components/ui/icon-symbol.ios', () => {
  const React = require('react');
  return { IconSymbol: (props) => React.createElement('span', {}, props?.name ?? '') };
});
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn(), WebBrowserPresentationStyle: { AUTOMATIC: 0 } }));
jest.mock('react-native-confetti-cannon', () => {
  const React = require('react');
  const C = (props) => React.createElement('div', { 'data-testid': 'confetti' }, null);
  return { __esModule: true, default: C };
});
jest.mock('@/src/services/audioService', () => ({ playSound: jest.fn(() => Promise.resolve()) }));

require('@testing-library/react-native/extend-expect');
