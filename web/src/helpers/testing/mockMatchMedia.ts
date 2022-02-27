export function setupMatchMediaMock(): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value:
      window.matchMedia ||
      function () {
        return {
          matches: false,
          addListener: function () {
            //
          },
          removeListener: function () {
            //
          },
        };
      },
  });
}
