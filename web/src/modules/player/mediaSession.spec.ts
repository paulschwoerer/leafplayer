import {
  addMediaSessionListeners,
  removeMediaSessionListeners,
  updateMediaSessionPlayState,
  updateMediaSessionPositionState,
} from './mediaSession';
import { PlaybackState } from './reducer';

function empty() {
  //
}

describe('media session', () => {
  const mockSetActionHandler = jest.fn();
  const mockSetPositionState = jest.fn();

  beforeAll(() => {
    Object.defineProperty(navigator, 'mediaSession', {
      value: {
        setActionHandler: mockSetActionHandler,
        setPositionState: mockSetPositionState,
      },
    });
  });

  beforeEach(() => {
    mockSetActionHandler.mockReset();
    mockSetPositionState.mockReset();
  });

  const events = ['play', 'pause', 'nexttrack', 'previoustrack', 'seekto'];

  it('registers event listeners', () => {
    addMediaSessionListeners({
      play: empty,
      pause: empty,
      skipNext: empty,
      skipPrevious: empty,
      seekTo: empty,
    });

    expect(mockSetActionHandler).toHaveBeenCalledTimes(events.length);
    for (const ev of events) {
      expect(mockSetActionHandler).toHaveBeenCalledWith(
        ev,
        expect.any(Function),
      );
    }
  });

  it('removes event listeners', () => {
    removeMediaSessionListeners();

    expect(mockSetActionHandler).toHaveBeenCalledTimes(events.length);
    for (const ev of events) {
      expect(mockSetActionHandler).toHaveBeenCalledWith(ev, null);
    }
  });

  it('sets play state', () => {
    updateMediaSessionPlayState(PlaybackState.PLAYING);

    expect(navigator.mediaSession?.playbackState).toEqual('playing');
  });

  it('sets position state', () => {
    const state = {
      duration: 1000,
      position: 100,
    };

    updateMediaSessionPositionState(state);

    expect(mockSetPositionState).toHaveBeenCalledTimes(1);
    expect(mockSetPositionState).toHaveBeenCalledWith(state);
  });
});
