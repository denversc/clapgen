import type { InputOptions, OutputOptions } from "rollup";

import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import type { Options as TerserOptions } from "@rollup/plugin-terser";

export function inputOptions(): InputOptions {
  return {
    input: "build/rollup/src/tscompiler/index.js",
    plugins: [resolve({ browser: true }), commonjs(), terser(terserOptions())],
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

function terserOptions(): TerserOptions {
  // Note: Terser reduces the bundle size from 9.5 MB down to 3.3 MB.
  return {
    sourceMap: false,
    format: {
      comments: false // saves 602,564 bytes
    }
  };
}
