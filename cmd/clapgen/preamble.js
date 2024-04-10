const clapgen_init = function clapgen_init() {
  if (arguments.length === 0) {
    throw new Error("expected exactly 1 argument, but got 0");
  } else if (arguments.length > 1) {
    throw new Error(`expected exactly 1 argument, but got ${arguments.length}`);
  }

  const options = arguments[0]
  if (typeof options != "object") {
    throw new Error(`expected the argument to be an object, but got ${typeof options}: ${options}`);
  }

  const configVersion = options.configVersion
  if (configVersion !== 1) {
    throw new Error(`unsupported value for the argument's 'configVersion' property: ` +
    `${configVersion} (the only supported value is the number 1)`);
  }

  if (clapgen_init.clapgenInstance) {
    throw new Error("clapgen_init() has already been called successfully; " +
      "make sure that you're only calling clapgen_init() once.");
  }

  class Clapgen {
    constructor() {
      this._arguments = [];
    }

    addArgument(flag) {
      if (typeof flag !== "string") {
        throw new Error(`'flag' argument should be a string, but got ` +
        `${typeof flag}: ${flag}`);
      }
      const argument = new ClapgenArgument(flag);
      this._arguments.push(argument);
      return argument;
    }
  }

  class ClapgenArgument {
    constructor(flag) {
      this.flag = flag;
    }
  }

  const clapgen = new Clapgen();

  clapgen_init.clapgenInstance = clapgen

  return clapgen;
}