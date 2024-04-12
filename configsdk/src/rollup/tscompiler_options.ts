import type { InputOptions, OutputOptions } from "rollup";

import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescriptPlugin from "rollup-plugin-typescript2";
import terser from "@rollup/plugin-terser";

export function inputOptions(): InputOptions {
  return {
    input: "src/tscompiler/index.ts",
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      typescriptPlugin({ tsconfig: "tsconfig.bundle.tscompiler.json" }),
      terser({ format: { comments: false } })
    ],
    logLevel: "debug"
  };
}

export function outputOptions(): OutputOptions {
  return {
    file: "dist/tscompiler.js",
    name: "compileTypeScript",
    format: "iife",
    sourcemap: false
  };
}
