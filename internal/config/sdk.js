const clapgen_init = function clapgen_init(initOptions, ...unexpectedArguments) {
  

  class Argument {
      constructor(flag) {
          this.flag = flag;
      }
  }

  class Clapgen {
      constructor() {
          this._arguments = [];
      }
      addArgument(flag) {
          const argument = new Argument(flag);
          this._arguments.push(argument);
          return argument;
      }
  }

  if (unexpectedArguments.length > 0) {
      throw new Error(`got ${unexpectedArguments.length} unexpected arguments`);
  }
  if (typeof initOptions != "object") {
      throw new Error(`expected the 'initOptions' argument to be an object, ` +
          `but got ${typeof initOptions}: ${initOptions}`);
  }
  if (clapgen_init.clapgenInstance) {
      throw new Error("clapgen_init() has already been called successfully; " +
          "make sure that you're only calling clapgen_init() once.");
  }
  const configVersion = initOptions.configVersion;
  if (configVersion !== 1) {
      throw new Error(`unsupported 'configVersion': ${configVersion} ` +
          `(the only supported value in this version of clapgen 1)`);
  }
  const clapgen = new Clapgen();
  clapgen_init.clapgenInstance = clapgen;

  return clapgen;

}
