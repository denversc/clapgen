import type { Platform, Logger } from "../../lib/platform";

export class GojaPlatform implements Platform {
  readonly logger: Logger;
  readonly _monotonic: MonotonicFunction;

  constructor(options: GojaPlatformOptions) {
    this.logger = new GojaLogger(options.println);
    this._monotonic = options.monotonic;
  }

  monotonic(): number {
    return this._monotonic();
  }
}

type MonotonicFunction = () => number;
type PrintlnFunction = (...args: unknown[]) => void;
interface GojaPlatformOptions {
  monotonic: () => number;
  println: (...args: unknown[]) => void;
}

class GojaLogger implements Logger {
  constructor(private readonly _println: PrintlnFunction) {}

  complete(...args: unknown[]): void {
    this._println(...args);
  }

  error(...args: unknown[]): void {
    this._println(...args);
  }

  info(...args: unknown[]): void {
    this._println(...args);
  }

  await(...args: unknown[]): void {
    this._println(...args);
  }

  note(...args: unknown[]): void {
    this._println(...args);
  }

  start(...args: unknown[]): void {
    this._println(...args);
  }

  success(...args: unknown[]): void {
    this._println(...args);
  }
}
