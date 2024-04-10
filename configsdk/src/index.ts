import { Clapgen } from "./clapgen";

declare const clapgen_init: any;
declare const unexpectedArguments: any[];
declare const initOptions: ClapgenInitOptions;

export interface ClapgenInitOptions {
  configVersion: number;
}

if (unexpectedArguments.length > 0) {
  throw new Error(`got ${unexpectedArguments.length} unexpected arguments`);
}

if (typeof initOptions != "object") {
  throw new Error(
    `expected the 'initOptions' argument to be an object, ` +
      `but got ${typeof initOptions}: ${initOptions}`
  );
}

if (clapgen_init.clapgenInstance) {
  throw new Error(
    "clapgen_init() has already been called successfully; " +
      "make sure that you're only calling clapgen_init() once."
  );
}

const configVersion = initOptions.configVersion;
if (configVersion !== 1) {
  throw new Error(
    `unsupported 'configVersion': ${configVersion} ` +
      `(the only supported value in this version of clapgen 1)`
  );
}

const clapgen = new Clapgen();

clapgen_init.clapgenInstance = clapgen;

export default clapgen;
