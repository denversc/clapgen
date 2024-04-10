import type {
  CompilerHost,
  SourceFile,
  CompilerOptions,
  ScriptTarget,
  CreateSourceFileOptions
} from "typescript";
import { createSourceFile } from "typescript";

declare function _clapgenLoadStaticFile(fileName: string): string | null;

export class SingleFileCompilerHost implements CompilerHost {
  private _output: { fileName: string; fileContents: string } | null = null;

  constructor(
    readonly fileName: string,
    readonly fileContents: string
  ) {}

  get outputText(): string {
    if (!this._output) {
      throw new Error("there is no output to return (error code nsejbw)");
    }
    return this._output.fileContents;
  }

  writeFile(fileName: string, fileContents: string): void {
    if (this._output) {
      throw new Error(
        "writeFile() called more than one time: " +
          `first call was for file '${this._output.fileName}', ` +
          `and second call was for file '${fileName}'`
      );
    }
    this._output = { fileName, fileContents };
  }

  fileExists(fileName: string): boolean {
    return fileName === this.fileName;
  }

  getCanonicalFileName(fileName: string): string {
    return fileName;
  }

  getCurrentDirectory(): string {
    return "";
  }

  getDefaultLibFileName(options: CompilerOptions): string {
    return "lib.d.ts";
  }

  getNewLine(): string {
    return "\n";
  }

  getSourceFile(
    fileName: string,
    languageVersionOrOptions: ScriptTarget | CreateSourceFileOptions
  ): SourceFile | undefined {
    const fileContents = this._getSourceFileContents(fileName);
    if (fileContents === undefined) {
      return undefined;
    }
    return createSourceFile(fileName, fileContents, languageVersionOrOptions);
  }

  private _getSourceFileContents(fileName: string): string | undefined {
    if (fileName === this.fileName) {
      return this.fileContents;
    }

    const staticFileContents = _clapgenLoadStaticFile(fileName);
    if (staticFileContents !== null) {
      return staticFileContents;
    }

    return _clapgenLoadStaticFile("lib." + fileName) ?? undefined;
  }

  readFile(fileName: string): string {
    throw new Error(
      `readFile() is not implemented, ` +
        `but was called with fileName: ${fileName} (error code w948fb)`
    );
  }

  useCaseSensitiveFileNames(): boolean {
    return true;
  }
}
