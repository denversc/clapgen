import { Argument } from "./argument";

export class Clapgen {
  private _arguments: Argument[] = [];

  addArgument(flag: string): Argument {
    const argument = new Argument(flag);
    this._arguments.push(argument);
    return argument;
  }
}
