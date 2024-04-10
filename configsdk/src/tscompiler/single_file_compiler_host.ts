import type {
  CompilerHost,
  SourceFile,
  CompilerOptions,
  ScriptTarget, CreateSourceFileOptions
} from "typescript";

export class SingleFileCompilerHost implements CompilerHost {

  private _output: {fileName: string, fileContents: string} | null = null;

  constructor(readonly fileName: string, readonly fileContents: string) {
  }

  get outputText(): string {
    if (!this._output) {
      throw new Error("there is no output to return (error code nsejbw)");
    }
    return this._output.fileContents;
  }

  writeFile(fileName: string, fileContents: string): void {
    if (this._output) {
      throw new Error("writeFile() called more than one time: " +
      `first call was for file '${this._output.fileName}', ` +
      `and second call was for file '${fileName}'`);
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
    return ""
  }

  getDefaultLibFileName(options: CompilerOptions): string {
    return "lib.d.ts";
  }

  getNewLine(): string {
    return "\n";
  }

  getSourceFile(
    fileName: string,
    languageVersionOrOptions: ScriptTarget | CreateSourceFileOptions,
    onError?: (message: string) => void,
    shouldCreateNewSourceFile?: boolean
  ): SourceFile {
    throw new Error(`getSourceFile() is not implemented; fileName=${fileName}  (error code xyy2ac)`);
  }

  readFile(fileName: string): string {
    throw new Error(`readFile() is not implemented, ` + `but was called with fileName: ${fileName} (error code w948fb)`);
  }

  useCaseSensitiveFileNames(): boolean {
    return true;
  }
}
