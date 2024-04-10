import type { CompilerOptions, TranspileOptions } from "typescript";

import {
  createProgram,
  ModuleKind,
  ScriptTarget,
  getLineAndCharacterOfPosition,
  ModuleResolutionKind,
  flattenDiagnosticMessageText
} from "typescript";
import { SingleFileCompilerHost } from "./single_file_compiler_host";

export default function compileTypeScript(fileName: string, fileContents: string): string {
  const compilerHost = new SingleFileCompilerHost(fileName, fileContents);
  const program = createProgram({
    rootNames: [fileName],
    options: tsCompilerOptions,
    host: compilerHost
  });
  const emitResult = program.emit();

  for (const diagnostic of emitResult.diagnostics) {
    if (diagnostic.file) {
      const { line, character } = getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
      const message = flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.log(flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    }
  }

  return compilerHost.outputText;
}

const tsCompilerOptions: CompilerOptions = {
  lib: ["es2021"],
  module: ModuleKind.None,
  declaration: false,
  inlineSourceMap: true,
  inlineSources: true,
  isolatedModules: true,
  noEmitOnError: true,
  target: ScriptTarget.ES2021,
  strict: true,
  moduleResolution: ModuleResolutionKind.Node10
};

function newTranspileOptions(fileName: string): TranspileOptions {
  return {
    fileName,
    reportDiagnostics: true,
    compilerOptions: {
      lib: ["es2021"],
      module: ModuleKind.None,
      declaration: false,
      inlineSourceMap: true,
      inlineSources: true,
      isolatedModules: true,
      noEmitOnError: true,
      target: ScriptTarget.ES2021,
      strict: true,
      moduleResolution: ModuleResolutionKind.Node10
    }
  };
}

const compileTypeScriptResult = compileTypeScript(
  "foobar.ts",
  `
interface Console {
  log(...args: unknown[]): void;
}
declare const console: Console;

function hello(arg: string): number {
  console.log("Hello!", arg);
  return 42;
}

const result = hello("world");
console.log("hello() returned:", result);
`
);

console.log("compileTypeScript() returned:", compileTypeScriptResult);
