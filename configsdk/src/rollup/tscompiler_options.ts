import type { InputOptions, OutputOptions } from "rollup";

import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export function inputOptions(): InputOptions {
  return {
    input: "build/rollup/tscompiler/index.js",
    plugins: [resolve({ browser: true }), commonjs(), terser({ format: { comments: false } })],
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
