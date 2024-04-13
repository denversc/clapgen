import type { CompilerOptions } from "typescript";

import {
  createProgram,
  ModuleKind,
  ScriptTarget,
  getLineAndCharacterOfPosition,
  ModuleResolutionKind,
  flattenDiagnosticMessageText
} from "typescript";

export { setPlatform } from "../lib/platform";
import { SingleFileCompilerHost } from "./single_file_compiler_host";
import { getLogger } from "../lib/platform";

interface CompileTypeScriptOptions {
  fileName: string;
  fileContents: string;
  loadFile: (...args: unknown[]) => void;
}

export default function compileTypeScript(options: CompileTypeScriptOptions): string {
  const { fileName, fileContents, loadFile } = options;
  const logger = getLogger();

  const compilerHost = new SingleFileCompilerHost(fileName, fileContents, loadFile);
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
      logger.info(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      logger.info(flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
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
