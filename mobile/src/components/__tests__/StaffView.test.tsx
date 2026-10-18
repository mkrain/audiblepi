/**
 * Smoke tests for the StaffView (live sheet-music staff).
 */
import * as React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

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

jest.mock('../../playback', () => ({
  getNotesWindow: jest.fn(),
  tapNoteAt: jest.fn(),
  scrubBySteps: jest.fn(),
}));

import { StaffView } from '../StaffView';
import { getNotesWindow, tapNoteAt } from '../../playback';
import { usePlayerStore } from '../../state/player';

const mockGetNotesWindow = getNotesWindow as jest.Mock;
const mockTapNoteAt = tapNoteAt as jest.Mock;

describe('StaffView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePlayerStore.getState().reset();
    mockGetNotesWindow.mockReturnValue([
      { offset: -1, digitIndex: 40, note: 'C', digit: '0' },
      { offset: 0, digitIndex: 41, note: 'D', digit: '2' },
      { offset: 1, digitIndex: 42, note: 'E', digit: '4' },
    ]);
  });

  test('renders staff lines and notes', () => {
    const root = render(<StaffView />).root;
    // 5 staff lines + playhead + notes render without crashing
    expect(mockGetNotesWindow).toHaveBeenCalledWith(3, 10);
  });

  test('tapping the staff plays the nearest note', () => {
    const root = render(<StaffView />).root;
    // Find the staff container (the responder view)
    const staff = root.findByProps({ testID: undefined });
    // Simulate a tap near the playhead (offset 0)
    act(() => {
      const responder = root.find(
        (node) =>
          node.props.onResponderGrant !== undefined &&
          node.props.onResponderRelease !== undefined,
      );
      responder.props.onResponderGrant({
        nativeEvent: { locationX: 110 },
      });
      responder.props.onResponderRelease({
        nativeEvent: { locationX: 110 },
      });
    });
    expect(mockTapNoteAt).toHaveBeenCalledWith(0);
  });
});
