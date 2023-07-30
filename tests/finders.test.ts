import { describe, expect, test } from "@jest/globals";
import { readFileSync } from "fs";
import jcs, {
  ObjectProperty,
  StringLiteral,
  TSPropertySignature
} from "jscodeshift";
import { IdentifierKind } from "ast-types/gen/kinds";
import finders from "../src/pipeline/finders";

const sourceContent = readFileSync("tests/test.template.ts", "utf-8");
const ast = jcs.withParser("tsx")(sourceContent);

describe("classBodyFinder", () => {
  test("ClassBody: Should return a ClassBody collection with 1 path.", () => {
    const collection = finders.classBodyFinder(jcs, ast, { name: "TestClass" });
    expect(collection.getTypes()[0]).toBe("ClassBody");
    expect(collection.size()).toBe(1);
  });
  test("ClassBody: Should throw a ClassBody empty error", () => {
    try {
      const collection = finders.classBodyFinder(jcs, ast, {
        name: "NonExistantClass"
      });
    } catch (error: any) {
      expect(error.message.includes("ClassBody is empty")).toBeTruthy();
    }
  });
});

describe("exportDefaultFinder", () => {
  const type = "ExportDefaultDeclaration";
  test(
    type + ": Should return an ExportDefaultDeclaration with 1 path.",
    () => {
      const { col, idName } = finders.exportDefaultFinder(jcs, ast);
      expect(col.getTypes()[0]).toBe(type);
      expect(col.size()).toBe(1);
    }
  );
});

describe("exportFinder", () => {
  const type = "ExportNamedDeclaration";
  const { col } = finders.exportFinder(jcs, ast);
  test(`${type}: Should return a ${type} collection with 1 path.`, () => {
    expect(col.getTypes()[0]).toBe(type);
    expect(col.size()).toBe(1);
  });

  const node = col.paths()[0].value;

  test(`${type}: Node should be have a declaration of null and 2 specifiers`, () => {
    expect(node.declaration).toBeNull();
    expect(node.specifiers?.length).toBe(2);
  });
});

describe("importFinder", () => {
  const type = "ImportDeclaration";
  const col = finders.importFinder(jcs, ast);

  test(`${type}: Should return a ${type} collection with 2 paths.`, () => {
    expect(col.size()).toBe(2);
    expect(col.getTypes()[0]).toBe(type);
  });
});

describe("programFinder", () => {
  const type = "Program";
  const col = finders.programFinder(jcs, ast);

  test(`${type}: Should return a ${type} collection with 1 path.`, () => {
    expect(col.size()).toBe(1);
    expect(col.getTypes()[0]).toBe(type);
  });
});

describe("switchFinder", () => {
  const type = "SwitchStatement";
  const col = finders.switchFinder(jcs, ast, { name: "testSwitch" });

  test(`${type}: Should return a ${type} collection with 1 path.`, () => {
    expect(col.size()).toBe(1);
    expect(col.getTypes()[0]).toBe(type);
  });
});

describe("tsEnumFinder", () => {
  const type = "TSEnumDeclaration";
  const { col, idName } = finders.tsEnumFinder(jcs, ast, { name: "TestEnum" });

  test(`${type}: Should return ${type} collection with 1 path.`, () => {
    expect(col.size()).toBe(1);
    expect(col.getTypes()[0]).toBe(type);
    expect(idName).toBe("TestEnum");
  });
  test(`${type}: Should have 1 enum member`, () => {
    expect(col.paths()[0].value.members.length).toBe(1);
  });
  test(`${type}: Should have an enum member called TEST_PROPERTY`, () => {
    expect((col.paths()[0].value.members[0].id as IdentifierKind).name).toBe(
      "TEST_PROPERTY"
    );
  });
});

describe("tsInterfaceBodyFinder", () => {
  const type = "TSInterfaceBody";
  const col = finders.tsInterfaceBodyFinder(jcs, ast, {
    name: "TestInterface"
  });

  test(`${type}: Should return a ${type} collection with 1 path.`, () => {
    expect(col.size()).toBe(1);
    expect(col.getTypes()[0]).toBe(type);
  });
  test(`${type}: Should have a property signature called testProperty`, () => {
    expect(
      (
        (col.paths()[0].value.body[0] as TSPropertySignature)
          .key as IdentifierKind
      ).name
    ).toBe("testProperty");
  });
});

describe("tsTypeAliasFinder", () => {
  const type = "TSTypeAliasDeclaration";
  const { col, idName } = finders.tsTypeAliasFinder(jcs, ast, {
    name: "TestAlias"
  });

  test(`${type}: Should return a ${type} collection with 1 path.`, () => {
    expect(col.size()).toBe(1);
    expect(col.getTypes()[0]).toBe(type);
  });
  test(`${type}: Should be a TSUnionType`, () => {
    expect(col.paths()[0].value.typeAnnotation.type).toBe("TSUnionType");
  });
});

describe("tsTypeLiteralFinder", () => {
  const type = "TSTypeLiteral";
  const { col, idName } = finders.tsTypeLiteralFinder(jcs, ast, {
    name: "TestTypeLiteral"
  });

  test(`${type}: Should return a ${type} collection with 1 path.`, () => {
    expect(col.size()).toBe(1);
    expect(col.getTypes()[0]).toBe(type);
  });
  test(`${type}: Should have a property called testProperty`, () => {
    expect(
      (
        (col.paths()[0].value.members[0] as TSPropertySignature)
          .key as IdentifierKind
      ).name
    ).toBe("testProperty");
  });
});

describe("arrayVariableFinder", () => {
  const type = "ArrayExpression";
  const col = finders.arrayVariableFinder(jcs, ast, { name: "testArray" });

  test(`${type}: Should return a ${type} collection with 1 path.`, () => {
    expect(col.size()).toBe(1);
    expect(col.getTypes()[0]).toBe(type);
  });
  test(`${type}: Should have an element called "test value"`, () => {
    expect((col.paths()[0].value.elements[0] as StringLiteral).value).toBe(
      "test value"
    );
  });
});

describe("objectVariableFinder", () => {
  const type = "ObjectExpression";
  const col = finders.objectVariableFinder(jcs, ast, { name: "testObject" });

  test(`${type}: Should return a ${type} collection with 1 path.`, () => {
    expect(col.size()).toBe(1);
    expect(col.getTypes()[0]).toBe(type);
  });
  test(`${type}: Should have a property called testProperty`, () => {
    expect(
      (
        (col.paths()[0].value.properties[0] as ObjectProperty)
          .key as IdentifierKind
      ).name
    ).toBe("testProperty");
  });
});
