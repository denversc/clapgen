import type { CompilerOptions } from "typescript";

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
    options: tsCompilerOptions(),
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

function tsCompilerOptions(): CompilerOptions {
  return {
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
}
