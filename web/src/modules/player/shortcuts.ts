type Actions = {
  skipNext: () => void;
  skipPrevious: () => void;
  togglePlayPause: () => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
};

export function registerKeyboardShortcuts({
  skipNext,
  skipPrevious,
  toggleMute,
  togglePlayPause,
  toggleShuffle,
}: Actions): void {
  document.onkeyup = ev => {
    if (
      !['input', 'textarea'].find(
        item => item === document.activeElement?.tagName.toLowerCase(),
      )
    ) {
      switch (ev.key) {
        case 'l':
          ev.preventDefault();
          skipNext();
          break;
        case 'j':
          ev.preventDefault();
          skipPrevious();
          break;
        case 'k':
        case ' ':
          ev.preventDefault();
          togglePlayPause();
          break;
        case 'm':
          ev.preventDefault();
          toggleMute();
          break;
        case 'r':
          ev.preventDefault();
          toggleShuffle();
          break;
      }
    }
  };
}

export function unregisterKeyboardShortcuts(): void {
  document.onkeyup = null;
}
