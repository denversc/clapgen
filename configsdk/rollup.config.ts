import type { RollupOptions } from "rollup";

import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescriptPlugin from "rollup-plugin-typescript2";

const config: RollupOptions = {
  logLevel: "debug",
  input: "src/index.ts",
  output: {
    file: "dist/sdk.js",
    name: "zzyzx",
    format: "iife",
    indent: "  "
  },
  plugins: [resolve(), typescriptPlugin(), commonjs()]
};

export default config;
