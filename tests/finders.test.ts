import { describe, expect, test } from "@jest/globals";
import { readFileSync } from "fs";
import jcs from "jscodeshift";
import finders from "../src/pipeline/finders";

const sourceContent = readFileSync("tests/test.template.ts", "utf-8");
const ast = jcs.withParser("tsx")(sourceContent);

describe("Testing Pipeline Finders", () => {
  test("ClassBody: Should return a ClassBody collection with 1 path.", () => {
    const collection = finders.classBodyFinder(jcs, ast, { name: "TestClass" });
    const size = collection.size();
    expect(size).toBe(1);
  });
});
