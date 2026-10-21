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

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('../../playback', () => ({
  getVisibleNotes: jest.fn(),
  getCurrentDigit: jest.fn(),
  getNoteStrip: jest.fn(),
  getUpcomingNotes: jest.fn(),
  getNotesWindow: jest.fn(() => []),
  getDigitTotal: jest.fn(),
  togglePlay: jest.fn(),
  stepNext: jest.fn(),
  stepPrevious: jest.fn(),
  tapNote: jest.fn(),
  tapNoteAt: jest.fn(),
  scrubBySteps: jest.fn(),
  seekToDigit: jest.fn(),
  cycleInstrument: jest.fn(),
  setInstrumentId: jest.fn(),
  startCalculation: jest.fn(),
  cancelCalculation: jest.fn(),
  startBackgroundCalculation: jest.fn(),
  cancelBackgroundCalculation: jest.fn(),
  switchToPrecomputed: jest.fn(),
}));

import { AboutScreen } from '../AboutScreen';
import { PlayerScreen } from '../PlayerScreen';
import { SettingsScreen } from '../SettingsScreen';
import {
  cancelBackgroundCalculation,
  cancelCalculation,
  cycleInstrument,
  getCurrentDigit,
  getDigitTotal,
  getNoteStrip,
  getUpcomingNotes,
  getVisibleNotes,
  seekToDigit,
  startBackgroundCalculation,
  startCalculation,
  stepNext,
  stepPrevious,
  tapNote,
  tapNoteAt,
  togglePlay,
} from '../../playback';
import { useCalculationStore } from '../../state/calculation';
import { usePlayerStore } from '../../state/player';
import { useSettingsStore } from '../../state/settings';

const mockGetVisibleNotes = getVisibleNotes as jest.Mock;
const mockGetCurrentDigit = getCurrentDigit as jest.Mock;
const mockGetNoteStrip = getNoteStrip as jest.Mock;
const mockGetUpcomingNotes = getUpcomingNotes as jest.Mock;
const mockGetDigitTotal = getDigitTotal as jest.Mock;
const mockTogglePlay = togglePlay as jest.Mock;
const mockStepNext = stepNext as jest.Mock;
const mockStepPrevious = stepPrevious as jest.Mock;
const mockTapNote = tapNote as jest.Mock;
const mockTapNoteAt = tapNoteAt as jest.Mock;
const mockSeekToDigit = seekToDigit as jest.Mock;
const mockCycleInstrument = cycleInstrument as jest.Mock;
const mockStartCalculation = startCalculation as jest.Mock;
const mockCancelCalculation = cancelCalculation as jest.Mock;
const mockStartBackgroundCalculation = startBackgroundCalculation as jest.Mock;
const mockCancelBackgroundCalculation = cancelBackgroundCalculation as jest.Mock;

describe('PlayerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetVisibleNotes.mockReturnValue({
      previous: 'C',
      current: 'C#',
      next: 'D',
    });
    mockGetCurrentDigit.mockReturnValue('1');
    mockGetNoteStrip.mockReturnValue([
      { offset: -2, digitIndex: 39, note: null, digit: null, base10Digit: null },
      { offset: -1, digitIndex: 40, note: 'C', digit: '0', base10Digit: '1' },
      { offset: 0, digitIndex: 41, note: 'C#', digit: '1', base10Digit: '4' },
      { offset: 1, digitIndex: 42, note: 'D', digit: '2', base10Digit: '1' },
      { offset: 2, digitIndex: 43, note: 'D#', digit: '3', base10Digit: '5' },
    ]);
    mockGetUpcomingNotes.mockReturnValue([
      { offset: 1, digitIndex: 42, note: 'D', digit: '2' },
      { offset: 2, digitIndex: 43, note: 'D#', digit: '3' },
      { offset: 3, digitIndex: 44, note: 'E', digit: '4' },
      { offset: 4, digitIndex: 45, note: 'F', digit: '5' },
      { offset: 5, digitIndex: 46, note: 'F#', digit: '6' },
      { offset: 6, digitIndex: 47, note: 'G', digit: '7' },
      { offset: 7, digitIndex: 48, note: 'G#', digit: '8' },
    ]);
    mockGetDigitTotal.mockReturnValue(1000);
    mockTogglePlay.mockResolvedValue(undefined);
    mockStartCalculation.mockResolvedValue(true);
    useSettingsStore.getState().resetToDefaults();
    usePlayerStore.getState().reset();
  });

  test('renders counter, note strip and transport controls', () => {
    usePlayerStore.setState({ digitIndex: 41 });
    const root = render(<PlayerScreen />).root;
    expect(root.findByProps({ testID: 'counter' }).props.children).toEqual([
      '42',
      ' of ',
      '1,000',
    ]);
    expect(root.findByProps({ testID: 'note-previous' }).props.label).toBe(
      'C',
    );
    expect(root.findByProps({ testID: 'note-current' }).props.label).toBe(
      'C#',
    );
    expect(root.findByProps({ testID: 'note-next' }).props.label).toBe('D');
    expect(root.findByProps({ testID: 'note-prev2' })).toBeTruthy();
    expect(root.findByProps({ testID: 'note-next2' })).toBeTruthy();
    expect(root.findByProps({ testID: 'base-indicator' })).toBeTruthy();
    expect(root.findByProps({ testID: 'instrument-button' })).toBeTruthy();
    expect(root.findByProps({ testID: 'transport-play' })).toBeTruthy();
    expect(root.findByProps({ testID: 'transport-previous' })).toBeTruthy();
    expect(root.findByProps({ testID: 'transport-next' })).toBeTruthy();
    expect(root.findByProps({ testID: 'scrubber' })).toBeTruthy();
    expect(root.findByProps({ testID: 'upnext-first' })).toBeTruthy();
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

  test('tapping a strip key sounds that offset note', () => {
    const root = render(<PlayerScreen />).root;
    root.findByProps({ testID: 'note-current' }).props.onPress();
    expect(mockTapNoteAt).toHaveBeenCalledWith(0);
    root.findByProps({ testID: 'note-next' }).props.onPress();
    expect(mockTapNoteAt).toHaveBeenCalledWith(1);
    root.findByProps({ testID: 'instrument-button' }).props.onPress();
    expect(mockCycleInstrument).toHaveBeenCalledTimes(1);
  });

  test('hero shows digit to note mapping', () => {
    usePlayerStore.setState({ digitIndex: 41 });
    const root = render(<PlayerScreen />).root;
    expect(root.findByProps({ testID: 'current-digit' }).props.children).toBe(
      '1',
    );
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

  test('turning off precomputed starts background calculation', () => {
    const root = render(<SettingsScreen />).root;
    root.findByProps({ testID: 'switch-precomputed' }).props.onValueChange(false);
    expect(useSettingsStore.getState().usePrecomputed).toBe(false);
    expect(useCalculationStore.getState().isCalculating).toBe(true);
    expect(mockStartBackgroundCalculation).toHaveBeenCalledTimes(1);
  });

  test('turning on precomputed finishes calculation state', () => {
    useCalculationStore.setState({ isCalculating: true, progressDigit: 100, targetDigits: 1000 });
    const root = render(<SettingsScreen />).root;
    root.findByProps({ testID: 'switch-precomputed' }).props.onValueChange(true);
    expect(useCalculationStore.getState().isCalculating).toBe(false);
  });

  test('changing digit count in calculated mode restarts computation', () => {
    useSettingsStore.setState({ usePrecomputed: false, digitCount: 1000 });
    const root = render(<SettingsScreen />).root;
    root.findByProps({ testID: 'picker-digits' }).props.onValueChange(50000);
    expect(mockCancelBackgroundCalculation).toHaveBeenCalled();
    expect(mockStartBackgroundCalculation).toHaveBeenCalledTimes(1);
    expect(mockStartBackgroundCalculation.mock.calls[0][0]).toBe(50000);
    expect(useCalculationStore.getState().targetDigits).toBe(50000);
  });
});

describe('PlayerScreen calculation banner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCalculationStore.setState({ isCalculating: false, progressDigit: 0, targetDigits: 0 });
    mockGetVisibleNotes.mockReturnValue({ previous: 'C', current: 'D', next: 'E' });
    mockGetDigitTotal.mockReturnValue(100);
  });

  test('shows computing progress during arctan phase', () => {
    useCalculationStore.setState({ isCalculating: true, progressDigit: -513, targetDigits: 1000 });
    const root = render(<PlayerScreen />).root;
    expect(
      root.findByProps({ testID: 'calc-progress' }).props.children,
    ).toEqual('Computing… term 513');
  });

  test('shows digit progress during extraction phase', () => {
    useCalculationStore.setState({ isCalculating: true, progressDigit: 250, targetDigits: 1000 });
    const root = render(<PlayerScreen />).root;
    expect(
      root.findByProps({ testID: 'calc-progress' }).props.children,
    ).toEqual('Digit 250 of 1,000');
  });

  test('cancel button calls cancelBackgroundCalculation', () => {
    useCalculationStore.setState({ isCalculating: true, progressDigit: -100, targetDigits: 1000 });
    const root = render(<PlayerScreen />).root;
    root.findByProps({ testID: 'calc-cancel' }).props.onPress();
    expect(mockCancelBackgroundCalculation).toHaveBeenCalledTimes(1);
  });

  test('shows normal counter when not calculating', () => {
    useCalculationStore.setState({ isCalculating: false });
    const root = render(<PlayerScreen />).root;
    expect(root.findByProps({ testID: 'counter' })).toBeTruthy();
  });
});

describe('AboutScreen', () => {
  test('renders title, version and sections', () => {
    const root = render(<AboutScreen />).root;
    expect(root.findByProps({ testID: 'about-title' }).props.children).toBe(
      'AudiblePi',
    );
    const texts = root
      .findAllByType(require('react-native').Text)
      .map((t) => t.props.children);
    const flat = texts.flat(Infinity).join('\n');
    expect(flat).toContain('2.0.0');
    expect(flat).toContain('The Player');
    expect(flat).toContain('About Pi');
    expect(flat).toContain('Tips');
    expect(flat).not.toContain('History');
  });
});
