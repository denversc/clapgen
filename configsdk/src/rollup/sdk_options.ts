import type {
  NormalizedOutputOptions,
  RenderedChunk,
  InputOptions,
  OutputOptions,
  OutputPlugin
} from "rollup";

// @ts-ignore
import sourcemaps from "rollup-plugin-sourcemaps";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { SourceMapGenerator } from "source-map";
import type { StartOfSourceMap } from "source-map";

export function inputOptions(): InputOptions {
  return {
    input: "build/rollup/sdk/index.js",
    plugins: [sourcemaps(), resolve({ browser: true }), commonjs()],
    logLevel: "debug"
  };
}

export function outputOptions(): OutputOptions {
  return {
    file: "dist/sdk.js",
    name: "clapgen_init",
    format: "iife",
    indent: "  ",
    strict: false,
    sourcemap: true,
    plugins: [iifeWrapperPlugin()]
  };
}

function iifeWrapperPlugin(): OutputPlugin {
  return {
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
  };
}
