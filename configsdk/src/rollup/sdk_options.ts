import type { InputOptions, OutputOptions, OutputPlugin } from "rollup";

// @ts-ignore
import sourcemaps from "rollup-plugin-sourcemaps";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

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
    banner: newPrefix,
    footer: newSuffix,
    strict: false,
    sourcemap: true,
    plugins: [iifeWrapperPlugin()]
  };
}

const oldPrefix = "var clapgen_init = (function () {";
const oldSuffix = "})();";
const newPrefix =
  "const clapgen_init = function clapgen_init(initOptions, ...unexpectedArguments) {";
const newSuffix = "}";

function iifeWrapperPlugin(): OutputPlugin {
  return {
    name: "clapgen-iife-rewriter",
    renderChunk(code: string): { code: string; map: null } {
      const oldPrefixStart = findPrefix(code, oldPrefix, newPrefix.length);
      const oldPrefixEnd = oldPrefixStart + oldPrefix.length;
      const oldSuffixStart = findSuffix(code, oldSuffix, code.length - newSuffix.length);
      const oldSuffixEnd = oldSuffixStart + oldSuffix.length;

      const modifiedCode =
        code.substring(0, oldPrefixStart) +
        " ".repeat(oldPrefix.length) +
        code.substring(oldPrefixEnd, oldSuffixStart) +
        " ".repeat(oldSuffix.length) +
        code.substring(oldSuffixEnd);

      // Return `null` for the `map` property, to indicate that the plugin made no changes to the
      // given `code` that require updates to the source map.
      // (see https://rollupjs.org/plugin-development/#source-code-transformations).
      return { code: modifiedCode, map: null };
    }
  };
}

function findPrefix(text: string, prefix: string, offset: number): number {
  while (/\s/.test(text.charAt(offset))) {
    offset++;
  }

  const actualPrefix = text.substring(offset, offset + prefix.length);
  if (actualPrefix != prefix) {
    throw new IIFEWrapperPluginError(
      `unexpected code at offset ${offset}: ` +
        +`${JSON.stringify(actualPrefix)} (expected ${JSON.stringify(prefix)})`
    );
  }

  return offset;
}

function findSuffix(text: string, suffix: string, endOffset: number): number {
  while (/\s/.test(text.charAt(endOffset - 1))) {
    endOffset--;
  }

  const startOffset = endOffset - suffix.length;
  const actualSuffix = text.substring(startOffset, endOffset);
  if (actualSuffix != suffix) {
    throw new IIFEWrapperPluginError(
      `unexpected code at offset ${startOffset}: ` +
        +`${JSON.stringify(actualSuffix)} (expected ${JSON.stringify(suffix)})`
    );
  }

  return startOffset;
}

class IIFEWrapperPluginError extends Error {
  override readonly name: "IIFEWrapperPluginError" = "IIFEWrapperPluginError";
}
