export function durationToString(
  duration: number,
  useColons = true,
  showSeconds = true,
): string {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor(duration / 60) % 60;
  const seconds = Math.floor(duration % 60);

  const hourString = hours ? `${hours}${useColons ? ':' : 'h '}` : '';
  const minuteString = `${minutes / 10 < 1 && hours ? '0' : ''}${minutes}${
    useColons ? ':' : 'm '
  }`;
  const secondString = `${seconds / 10 < 1 ? '0' : ''}${seconds}${
    useColons ? '' : 's '
  }`;

  return showSeconds
    ? `${hourString}${minuteString}${secondString}`
    : `${hourString}${minuteString}`;
}

export function dateFromUnixTimestamp(timestampSeconds: number): Date {
  return new Date(timestampSeconds * 1000);
}
