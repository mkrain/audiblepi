/**
 * App bootstrap test: verifies the loading state while initApp() is pending
 * and the tab navigator once it resolves.
 *
 * @format
 */

import * as React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    set: jest.fn(),
    getBoolean: jest.fn(),
    getNumber: jest.fn(),
  })),
}));

jest.mock('../src/playback', () => ({
  initApp: jest.fn(),
  getVisibleNotes: jest.fn(() => ({ previous: null, current: 'C', next: 'D' })),
  getDigitTotal: jest.fn(() => 1000),
  togglePlay: jest.fn(),
  stepNext: jest.fn(),
  stepPrevious: jest.fn(),
  tapNote: jest.fn(),
  cycleInstrument: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => {
  const ReactMock = require('react') as typeof React;
  const { Text } = require('react-native') as typeof import('react-native');
  return {
    Ionicons: ({ name }: { name: string }) =>
      ReactMock.createElement(Text, null, name),
  };
});

// The real provider withholds children until native insets arrive,
// which never happens in Jest — passthrough instead, with the contexts
// that @react-navigation/bottom-tabs consumes.
jest.mock('react-native-safe-area-context', () => {
  const ReactMock = require('react') as typeof React;
  const RN = require('react-native') as typeof import('react-native');
  const insets = { top: 0, bottom: 0, left: 0, right: 0 };
  const frame = { x: 0, y: 0, width: 0, height: 0 };
  return {
    SafeAreaProvider: ({ children }: { children?: React.ReactNode }) =>
      ReactMock.createElement(RN.View, null, children),
    SafeAreaView: ({
      children,
      testID,
    }: {
      children?: React.ReactNode;
      testID?: string;
    }) => ReactMock.createElement(RN.View, { testID }, children),
    SafeAreaInsetsContext: ReactMock.createContext(insets),
    SafeAreaFrameContext: ReactMock.createContext(frame),
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
  };
});

jest.mock('@react-native-picker/picker', () => {
  const ReactMock = require('react') as typeof React;
  const RN = require('react-native') as typeof import('react-native');
  const Picker = ({
    children,
    testID,
  }: {
    children?: React.ReactNode;
    testID?: string;
  }) => ReactMock.createElement(RN.View, { testID }, children);
  Picker.Item = () => null;
  return { Picker };
});

// Native splash module isn't present in Jest — stub the hide call.
jest.mock('react-native-bootsplash', () => ({
  __esModule: true,
  default: { hide: jest.fn(() => Promise.resolve()) },
}));

// AdMob has no native module in Jest — stub init and the banner view.
jest.mock('react-native-google-mobile-ads', () => {
  const ReactMock = require('react') as typeof React;
  const RN = require('react-native') as typeof import('react-native');
  return {
    __esModule: true,
    default: jest.fn(() => ({
      initialize: jest.fn(() => Promise.resolve()),
    })),
    BannerAd: () => ReactMock.createElement(RN.View, { testID: 'mock-banner-ad' }),
    BannerAdSize: { ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER' },
    TestIds: { BANNER: 'test-banner-id' },
  };
});

import App from '../App';
import { initApp } from '../src/playback';

const mockInitApp = initApp as jest.Mock;

test('shows loading indicator, then the tab navigator', async () => {
  let resolveInit!: () => void;
  mockInitApp.mockReturnValue(
    new Promise<void>((resolve) => {
      resolveInit = resolve;
    }),
  );

  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(<App />);
  });
  expect(renderer.root.findByProps({ testID: 'app-loading' })).toBeTruthy();

  await act(async () => {
    resolveInit();
  });
  expect(renderer.root.findByType(NavigationContainer)).toBeTruthy();
  // Player tab is the default route.
  expect(renderer.root.findByProps({ testID: 'counter' })).toBeTruthy();
  // The AdMob banner sits below the tab navigator on every screen.
  expect(renderer.root.findByProps({ testID: 'ad-banner' })).toBeTruthy();
});
