import type { Plugin, RollupOptions } from "rollup";

import copy from "rollup-plugin-copy";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import typescriptPlugin from "rollup-plugin-typescript2";

const iifeWrapperPlugin = {
  name: "clapgen-iife-rewriter",
  renderChunk(code: string, ..._ignored: unknown[]): string {
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

const copySdkJsPlugin = copy({
  targets: [
    {
      src: "./dist/sdk.js",
      dest: "../internal/config"
    }
  ],
  flatten: true,
  overwrite: true,
  verbose: true
});

const sdkConfig: RollupOptions = {
  input: "src/sdk/index.ts",
  output: {
    file: "dist/sdk.js",
    name: "zzyzx",
    format: "iife",
    indent: "  ",
    plugins: [iifeWrapperPlugin]
  },
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    typescriptPlugin({ tsconfig: "./tsconfig.bundle.sdk.json" }),
    copySdkJsPlugin
  ],
  logLevel: "debug"
};

const tsCompilerConfig: RollupOptions = {
  input: "src/tscompiler/index.ts",
  output: {
    file: "dist/tscompiler.js",
    name: "compileTypeScript",
    format: "iife",
    indent: "  "
  },
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    typescriptPlugin({ tsconfig: "./tsconfig.bundle.tscompiler.json" }),
    terser({ format: { comments: false } })
  ],
  logLevel: "debug"
};

// noinspection JSUnusedGlobalSymbols
export default [sdkConfig, tsCompilerConfig];
