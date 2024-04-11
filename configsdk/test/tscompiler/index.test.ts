//import { expect } from "chai";
import compileTypeScript from "../../src/tscompiler/index";

describe("tscompiler", () => {
  it("compiles valid TypeScript", () => {
    compileTypeScript(
      "foo.ts",
      `
      function hello(arg: string): number {
        console.log("hello", arg);
        return 42;
      }
      hello("World!");
    `
    );
  });
});
