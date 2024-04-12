export function log(...args: unknown[]): void {
  console.log(...args);
}

export function formatElapsedTime(startTime: number, endTime: number): string {
  const milliseconds = endTime - startTime;
  const minutes = Math.floor(milliseconds / (1000 * 60));
  const seconds = (milliseconds - minutes * 1000 * 60) / 1000;

  const formattedSeconds = seconds.toFixed(3) + "s";
  if (minutes == 0) {
    return formattedSeconds;
  } else {
    return `${minutes}m ${formattedSeconds}`;
  }
}
