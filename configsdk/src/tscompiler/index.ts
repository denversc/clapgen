import type { CompilerOptions, TranspileOptions } from "typescript";

import { createProgram, ModuleKind, ScriptTarget, getLineAndCharacterOfPosition, ModuleResolutionKind, flattenDiagnosticMessageText } from "typescript";
import { SingleFileCompilerHost } from "./single_file_compiler_host";

export default function compileTypeScript(fileName: string, fileContents: string): string {
  const compilerHost = new SingleFileCompilerHost(fileName, fileContents);
  const program = createProgram({rootNames: [fileName], options: tsCompilerOptions, host: compilerHost});
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

  const emittedFiles = emitResult.emittedFiles;
  if (!emittedFiles || emittedFiles.length == 0) {
    throw new Error("no files were emitted by TypeScript compilation, but expected exactly 1");
  } else if (emittedFiles.length > 1) {
    throw new Error(`expected exactly 1 file to be emitted, ` + `but got ${emittedFiles.length}: ${emittedFiles}`);
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
}

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
  }
}
