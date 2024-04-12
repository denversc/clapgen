import { NormalizedOutputOptions, Plugin, RenderedChunk, RollupOptions } from "rollup";

import type { StartOfSourceMap } from "source-map";
import { SourceMapGenerator } from "source-map";
import copy from "rollup-plugin-copy";
import sourcemaps from "rollup-plugin-sourcemaps";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import typescriptPlugin from "rollup-plugin-typescript2";

const iifeWrapperPlugin = {
  name: "clapgen-iife-rewriter",
  renderChunk(
    code: string,
    chunk: RenderedChunk,
    options: NormalizedOutputOptions
  ): { code: string; map?: string } {
    // Replace the IIFE wrapper with a normal function.
    const prefix = "var clapgen_init = (function () {";
    if (!code.startsWith(prefix)) {
      throw new Error(`expected code to start with: ${prefix}`);
    }
    const suffix = "})();";
    if (!code.endsWith(suffix)) {
      throw new Error(`expected code to end with: ${suffix}`);
    }

    const modifiedCode =
      "const clapgen_init = function clapgen_init(initOptions, ...unexpectedArguments) {" +
      code.substring(prefix.length, code.length - suffix.length) +
      "}";

    if (!options.sourcemap) {
      return { code: modifiedCode };
    }

    const sourceMapGeneratorOptions: StartOfSourceMap = {};
    if (options.file !== undefined) {
      sourceMapGeneratorOptions.file = options.file;
    }
    const sourceMapGenerator = new SourceMapGenerator(sourceMapGeneratorOptions);
    sourceMapGenerator.setSourceContent(chunk.fileName, code);
    function addSourceMapping(originalColumn: number, generatedColumn: number, name: string) {
      sourceMapGenerator.addMapping({
        original: { line: 1, column: originalColumn },
        generated: { line: 1, column: generatedColumn },
        source: chunk.fileName,
        name
      });
    }

    addSourceMapping(4, 6, "clapgen_init start");
    addSourceMapping(17, 19, "equals sign start");
    addSourceMapping(20, 21, "function keyword start");
    addSourceMapping(29, 42, "parameter list opening parenthesis");
    addSourceMapping(30, 78, "parameter list closing parenthesis");
    addSourceMapping(32, 80, "opening squiggly bracket");

    return { code: modifiedCode, map: sourceMapGenerator.toString() };
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
    name: "clapgen_init",
    format: "iife",
    indent: "  ",
    strict: false,
    sourcemap: "inline",
    plugins: [iifeWrapperPlugin]
  },
  plugins: [
    sourcemaps(),
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
