import { describe, expect, test } from "@jest/globals";
import { readFileSync } from "fs";
import jcs, {
  ObjectProperty,
  StringLiteral,
  TSPropertySignature
} from "jscodeshift";
import { IdentifierKind } from "ast-types/gen/kinds";
import finders from "../src/pipeline/finders";
import { AttributeValue } from "../src/@types/finder";

const sourceContent = readFileSync("tests/test.template.tsx", "utf-8");
const ast = jcs.withParser("tsx")(sourceContent);

describe("classBodyFinder", () => {
  test("ClassBody: Should return a ClassBody collection with 1 path.", () => {
    const found = finders.classBodyFinder(jcs, ast, { name: "TestClass" });
    expect(found.col.getTypes()[0]).toBe("ClassBody");
    expect(found.col.size()).toBe(1);
  });
  test("ClassBody: Should throw a ClassBody empty error", () => {
    const name = "NonExistantClass";
    try {
      const collection = finders.classBodyFinder(jcs, ast, { name });
    } catch (error: any) {
      expect(error.message.includes(name + " is empty")).toBeTruthy();
    }
  });
});

describe("exportDefaultFinder", () => {
  const type = "ExportDefaultDeclaration";
  test(
    type + ": Should return an ExportDefaultDeclaration with 1 path.",
    () => {
      const { col, idName } = finders.exportDefaultFinder(jcs, ast, {});
      expect(col.getTypes()[0]).toBe(type);
      expect(col.size()).toBe(1);
    }
  );
});

describe("exportFinder", () => {
  const type = "ExportNamedDeclaration";
  const { col } = finders.exportFinder(jcs, ast, {});
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
  const col = finders.importFinder(jcs, ast, {});

  test(`${type}: Should return a ${type} collection with 2 path.`, () => {
    expect(col.size()).toBe(2);
    expect(col.getTypes()[0]).toBe(type);
  });
});

describe("programFinder", () => {
  const type = "Program";
  const { col } = finders.programFinder(jcs, ast, {});

  test(`${type}: Should return a ${type} collection with 1 path.`, () => {
    expect(col.size()).toBe(1);
    expect(col.getTypes()[0]).toBe(type);
  });
});

describe("switchFinder", () => {
  const type = "SwitchStatement";
  const found = finders.switchFinder(jcs, ast, { name: "testSwitch" });

  test(`${type}: Should return a ${type} collection with 1 path.`, () => {
    expect(found.col.size()).toBe(1);
    expect(found.col.getTypes()[0]).toBe(type);
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
  const found = finders.tsInterfaceBodyFinder(jcs, ast, {
    name: "TestInterface"
  });

  test(`${type}: Should return a ${type} collection with 1 path.`, () => {
    expect(found.col.size()).toBe(1);
    expect(found.col.getTypes()[0]).toBe(type);
  });
  test(`${type}: Should have a property signature called testProperty`, () => {
    expect(
      (
        (found.col.paths()[0].value.body[0] as TSPropertySignature)
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
  const found = finders.arrayVariableFinder(jcs, ast, { name: "testArray" });

  test(`${type}: Should return a ${type} collection with 1 path.`, () => {
    expect(found.col.size()).toBe(1);
    expect(found.col.getTypes()[0]).toBe(type);
  });
  test(`${type}: Should have an element called "test value"`, () => {
    expect(
      (found.col.paths()[0].value.elements[0] as StringLiteral).value
    ).toBe("test value");
  });
});

describe("objectVariableFinder", () => {
  const type = "ObjectExpression";
  const found = finders.objectVariableFinder(jcs, ast, { name: "testObject" });

  test(`${type}: Should return a ${type} collection with 1 path.`, () => {
    expect(found.col.size()).toBe(1);
    expect(found.col.getTypes()[0]).toBe(type);
  });
  test(`${type}: Should have a property called testProperty`, () => {
    expect(
      (
        (found.col.paths()[0].value.properties[0] as ObjectProperty)
          .key as IdentifierKind
      ).name
    ).toBe("testProperty");
  });
});

describe("tsNamespaceFinder", () => {
  const type = "TSModuleDeclaration";
  const name = "King";
  const found = finders.tsNamespaceFinder(jcs, ast, { name });

  test(`${type}: Should return a ${type} collection with 1 path.`, () => {
    expect(found.col.size()).toBe(1);
    expect(found.col.getTypes()[0]).toBe(type);
  });
  const id = found.col.paths()[0].value.id;
  expect(id.type).toBe("Identifier");
  if (id.type === "Identifier") expect(id.name).toBe(name);
});

describe("jsxElementFinder", () => {
  const type = "JSXElement";
  const found = finders.jsxElementFinder(jcs, ast, { name: "React.Fragment" });

  test(`${type}: Should return a ${type} collection with 1 path.`, () => {
    expect(found.col.size()).toBe(1);
    expect(found.col.getTypes()[0]).toBe(type);
  });

  const name = "TestElement";
  const found0 = finders.jsxElementFinder(jcs, ast, { name });

  test(`${type}: Should find a ${type} by it's name "${name}"`, () => {
    const name = found0.col.paths()[0].value.openingElement.name;
    expect(name.type).toBe("JSXIdentifier");
    if (name.type === "JSXIdentifier") expect(name.name).toBe("TestElement");
    expect(found0.col.getTypes()[0]).toBe(type);
  });

  const attributeName = "title";
  const found1 = finders.jsxElementFinder(jcs, ast, { attributeName });

  test(`${type}: Should find a ${type} by it's attribute name "${attributeName}"`, () => {
    const name = found1.col.paths()[0].value.openingElement.name;
    expect(name.type).toBe("JSXIdentifier");
    if (name.type === "JSXIdentifier") expect(name.name).toBe("TestElement");
    expect(found1.col.getTypes()[0]).toBe(type);
  });

  const attributeValue: AttributeValue = {
    type: "StringLiteral",
    value: "test"
  };
  const found2 = finders.jsxElementFinder(jcs, ast, {
    attributeValue
  });

  test(`${type}: Should find a ${type} by it's attribute value "${JSON.stringify(
    attributeValue
  )}"`, () => {
    const name = found2.col.paths()[0].value.openingElement.name;
    expect(name.type).toBe("JSXIdentifier");
    if (name.type === "JSXIdentifier") expect(name.name).toBe("TestElement");
    expect(found2.col.getTypes()[0]).toBe(type);
  });

  test(`${type}: Element should have the attribute "title"`, () => {
    const foundArr = [found0, found1, found2];
    foundArr.forEach(foundCol => {
      const attributes =
        foundCol.col.paths()[0].value.openingElement.attributes;
      expect(attributes).toBeDefined();
      if (attributes) {
        const firstAttribute = attributes[0];
        expect(firstAttribute.type).toBe("JSXAttribute");
        if (firstAttribute.type === "JSXAttribute") {
          expect(firstAttribute.name.type).toBe("JSXIdentifier");
          expect(firstAttribute.name.name).toBe("title");
        }
      }
    });
  });
});

describe("functionFinder", () => {
  const type = "ArrowFunctionExpression";
  const type2 = "FunctionExpression";
  const type3 = "FunctionDeclaration";

  const { col } = finders.functionFinder(jcs, ast, {
    name: "TestComponent2"
  });
  const { col: col2 } = finders.functionFinder(jcs, ast, {
    name: "funcExp"
  });
  const { col: col3 } = finders.functionFinder(jcs, ast, {
    name: "funcDec"
  });

  test("ArrowFunctionExpression: Should return a ArrowFunction collection with 1 path.", () => {
    expect(col.size()).toBe(1);
    expect(col.getTypes()[0]).toBe(type);
  });
  test("FunctionExpression: Should return a FunctionExpression collection with 1 path.", () => {
    expect(col2.size()).toBe(1);
    expect(col2.getTypes()[0]).toBe(type2);
  });
  test("FunctionDeclaration: Should return a FunctionDeclaration collection with 1 path.", () => {
    expect(col3.size()).toBe(1);
    expect(col3.getTypes()[0]).toBe(type3);
  });
});

describe("returnFinder", () => {
  const type = "ReturnStatement";
  const { col } = finders.returnFinder(jcs, ast, {});
  test("ReturnStatement: Should return a ReturnStatement collection with 2 paths.", () => {
    expect(col.size()).toBe(2);
    expect(col.getTypes()[0]).toBe(type);
  });

  const { col: col2 } = finders.returnFinder(jcs, ast, {
    argumentType: "ObjectExpression"
  });
  test("ReturnStatement: Should return a ReturnStatement collection with 1 path.", () => {
    expect(col2.size()).toBe(1);
    expect(col2.getTypes()[0]).toBe(type);
  });
});

const reactSourceContent = readFileSync(
  "tests/experimentTemplates/test.react.template.tsx",
  "utf-8"
);
const reactAST = jcs.withParser("tsx")(reactSourceContent);

describe("useEffectFinder", () => {
  const type = "CallExpression";
  const { col } = finders.useEffectFinder(jcs, reactAST, {});

  test("CallExpression: Should return a CallExpression collection with 2 path.", () => {
    expect(col.size()).toBe(2);
    expect(col.getTypes()[0]).toBe(type);
  });
});
