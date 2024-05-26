import { describe, expect, test } from "@jest/globals";
import { readFileSync } from "fs";
import jcs from "jscodeshift";

const sourceContent = readFileSync("tests/test.template.tsx", "utf-8");
const ast = jcs.withParser("tsx")(sourceContent);

describe("Testing Jscodeshift", () => {
  test("toSource method return value should equal source file contents", () => {
    const source = ast.toSource();
    expect(source).toBe(sourceContent);
  });
});
