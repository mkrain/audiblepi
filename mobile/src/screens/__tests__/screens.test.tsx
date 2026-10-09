/**
 * Smoke tests for the Phase 3 screens. The playback orchestration module is
 * mocked (its own integration is covered elsewhere); these tests verify the
 * screens render the right controls and call the right actions.
 */

import * as React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

/** React 19's test renderer only flushes inside act(). */
function render(element: React.ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(element);
  });
  return renderer;
}

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    set: jest.fn(),
    getBoolean: jest.fn(),
    getNumber: jest.fn(),
  })),
}));

jest.mock('@expo/vector-icons', () => {
  const ReactMock = require('react') as typeof React;
  const { Text } = require('react-native') as typeof import('react-native');
  return {
    Ionicons: ({ name }: { name: string }) =>
      ReactMock.createElement(Text, null, name),
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

jest.mock('../../playback', () => ({
  getVisibleNotes: jest.fn(),
  getDigitTotal: jest.fn(),
  togglePlay: jest.fn(),
  stepNext: jest.fn(),
  stepPrevious: jest.fn(),
  tapNote: jest.fn(),
  cycleInstrument: jest.fn(),
  setInstrumentId: jest.fn(),
  startCalculation: jest.fn(),
  cancelCalculation: jest.fn(),
  switchToPrecomputed: jest.fn(),
}));

import { AboutScreen } from '../AboutScreen';
import { PlayerScreen } from '../PlayerScreen';
import { SettingsScreen } from '../SettingsScreen';
import {
  cancelCalculation,
  cycleInstrument,
  getDigitTotal,
  getVisibleNotes,
  startCalculation,
  stepNext,
  stepPrevious,
  tapNote,
  togglePlay,
} from '../../playback';
import { useCalculationStore } from '../../state/calculation';
import { usePlayerStore } from '../../state/player';
import { useSettingsStore } from '../../state/settings';

const mockGetVisibleNotes = getVisibleNotes as jest.Mock;
const mockGetDigitTotal = getDigitTotal as jest.Mock;
const mockTogglePlay = togglePlay as jest.Mock;
const mockStepNext = stepNext as jest.Mock;
const mockStepPrevious = stepPrevious as jest.Mock;
const mockTapNote = tapNote as jest.Mock;
const mockCycleInstrument = cycleInstrument as jest.Mock;
const mockStartCalculation = startCalculation as jest.Mock;
const mockCancelCalculation = cancelCalculation as jest.Mock;

describe('PlayerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetVisibleNotes.mockReturnValue({
      previous: 'C',
      current: 'C#',
      next: 'D',
    });
    mockGetDigitTotal.mockReturnValue(1000);
    mockTogglePlay.mockResolvedValue(undefined);
    mockStartCalculation.mockResolvedValue(true);
    useSettingsStore.getState().resetToDefaults();
    usePlayerStore.getState().reset();
  });

  test('renders counter, note buttons and transport controls', () => {
    usePlayerStore.setState({ digitIndex: 41 });
    const root = render(<PlayerScreen />).root;
    expect(root.findByProps({ testID: 'counter' }).props.children).toEqual([
      'digit ',
      42,
      ' of ',
      1000,
    ]);
    expect(root.findByProps({ testID: 'note-previous' }).props.label).toBe(
      'C',
    );
    expect(root.findByProps({ testID: 'note-current' }).props.label).toBe(
      'C#',
    );
    expect(root.findByProps({ testID: 'note-next' }).props.label).toBe('D');
    expect(root.findByProps({ testID: 'base-indicator' })).toBeTruthy();
    expect(root.findByProps({ testID: 'instrument-button' })).toBeTruthy();
    expect(root.findByProps({ testID: 'transport-play' })).toBeTruthy();
    expect(root.findByProps({ testID: 'transport-previous' })).toBeTruthy();
    expect(root.findByProps({ testID: 'transport-next' })).toBeTruthy();
  });

  test('transport buttons call playback actions', () => {
    const root = render(<PlayerScreen />).root;
    root.findByProps({ testID: 'transport-play' }).props.onPress();
    expect(mockTogglePlay).toHaveBeenCalledTimes(1);
    root.findByProps({ testID: 'transport-next' }).props.onPress();
    expect(mockStepNext).toHaveBeenCalledTimes(1);
    root.findByProps({ testID: 'transport-previous' }).props.onPress();
    expect(mockStepPrevious).toHaveBeenCalledTimes(1);
  });

  test('tapping a note button sounds that note', () => {
    const root = render(<PlayerScreen />).root;
    root.findByProps({ testID: 'note-current' }).props.onPress();
    expect(mockTapNote).toHaveBeenCalledWith('current');
    root.findByProps({ testID: 'instrument-button' }).props.onPress();
    expect(mockCycleInstrument).toHaveBeenCalledTimes(1);
  });
});

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSettingsStore.getState().resetToDefaults();
    useCalculationStore.setState({ isCalculating: false, progressDigit: 0 });
  });

  test('renders all setting rows', () => {
    const root = render(<SettingsScreen />).root;
    expect(root.findByProps({ testID: 'picker-instrument' })).toBeTruthy();
    expect(root.findByProps({ testID: 'picker-skip' })).toBeTruthy();
    expect(root.findByProps({ testID: 'picker-tempo' })).toBeTruthy();
    expect(root.findByProps({ testID: 'switch-loop' })).toBeTruthy();
    expect(root.findByProps({ testID: 'switch-precomputed' })).toBeTruthy();
  });

  test('loop switch writes through to the settings store', () => {
    const root = render(<SettingsScreen />).root;
    root.findByProps({ testID: 'switch-loop' }).props.onValueChange(true);
    expect(useSettingsStore.getState().loopSound).toBe(true);
  });

  test('turning off precomputed starts the calculation flow', () => {
    mockStartCalculation.mockResolvedValue(true);
    const root = render(<SettingsScreen />).root;
    root.findByProps({ testID: 'switch-precomputed' }).props.onValueChange(false);
    expect(useSettingsStore.getState().usePrecomputed).toBe(false);
    expect(useCalculationStore.getState().isCalculating).toBe(true);
    expect(mockStartCalculation).toHaveBeenCalledTimes(1);
  });

  test('calculation overlay shows progress and cancel calls through', () => {
    useCalculationStore.setState({ isCalculating: true, progressDigit: 1234 });
    const root = render(<SettingsScreen />).root;
    expect(root.findByProps({ testID: 'calc-overlay' })).toBeTruthy();
    expect(
      root.findByProps({ testID: 'calc-progress' }).props.children,
    ).toEqual(['Digit ', '1,234']);
    root.findByProps({ testID: 'calc-cancel' }).props.onPress();
    expect(mockCancelCalculation).toHaveBeenCalledTimes(1);
  });
});

describe('AboutScreen', () => {
  test('renders title, version and sections', () => {
    const root = render(<AboutScreen />).root;
    expect(root.findByProps({ testID: 'about-title' }).props.children).toBe(
      'Audible.Pi',
    );
    const texts = root
      .findAllByType(require('react-native').Text)
      .map((t) => t.props.children);
    const flat = texts.flat(Infinity).join('\n');
    expect(flat).toContain('1.2.1.0');
    expect(flat).toContain('History');
    expect(flat).toContain('About Pi');
    expect(flat).toContain('Tips');
  });
});
