import type { NormalizedOutputOptions, Plugin, RenderedChunk, RollupOptions } from "rollup";

import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescriptPlugin from "rollup-plugin-typescript2";

const iifeWrapperPlugin = {
  name: "clapgen-iife-rewriter",
  renderChunk(
    code: string,
    chunk: RenderedChunk,
    options: NormalizedOutputOptions,
    meta: unknown
  ): string {
    // Remove "use strict" because its presence causes a compile-time error:
    // Illegal 'use strict' directive in function with non-simple parameter list
    const useStrict = "'use strict';";
    const useStrictStart = code.indexOf(useStrict);
    if (useStrictStart < 0) {
      throw new Error(`expected code to contain: ${useStrict}`);
    }
    const nonStrictCode =
      code.substring(0, useStrictStart) + code.substring(useStrictStart + useStrict.length);

    // Replace the IIFE wrapper with a normal function.
    const prefix = "var zzyzx = (function () {";
    if (!nonStrictCode.startsWith(prefix)) {
      throw new Error(`expected code to start with: ${prefix}`);
    }
    const suffix = "})();";
    if (!nonStrictCode.endsWith(suffix)) {
      throw new Error(`expected code to end with: ${suffix}`);
    }

    return (
      "const clapgen_init = function clapgen_init(initOptions, ...unexpectedArguments) {" +
      nonStrictCode.substring(prefix.length, nonStrictCode.length - suffix.length) +
      "}"
    );
  }
} satisfies Plugin;

const config: RollupOptions = {
  logLevel: "debug",
  input: "src/index.ts",
  output: {
    file: "dist/sdk.js",
    name: "zzyzx",
    format: "iife",
    indent: "  ",
    plugins: [iifeWrapperPlugin]
  },
  plugins: [resolve(), typescriptPlugin(), commonjs()]
};

export default config;
