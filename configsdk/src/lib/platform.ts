export interface Logger {
  info(...args: unknown[]): void;
  error(...args: unknown[]): void;
  complete(...args: unknown[]): void;
  start(...args: unknown[]): void;
  note(...args: unknown[]): void;
  await(...args: unknown[]): void;
  success(...args: unknown[]): void;
}

export interface Platform {
  readonly logger: Logger;
  monotonic(): number;
}

let platform: Platform | null = null;

export function setPlatform(newPlatform: Platform): void {
  if (platform) {
    throw new Error("setPlatform() called more than once" + " (it must only be called once)");
  }
  platform = newPlatform;
}

function getPlatform(): Platform {
  if (!platform) {
    throw new Error(
      "setPlatform() must be called" + " before trying to access the Platform object"
    );
  }
  return platform;
}

export function getLogger(): Logger {
  return getPlatform().logger;
}

export function monotonic(): number {
  return getPlatform().monotonic();
}
