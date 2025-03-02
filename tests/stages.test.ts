//$lf-ignore
import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import InjectionPipeline from "../src/pipeline/Injection.pipeline";
import { StageOptions } from "../src/@types/stage";
import { FinderOptions } from "../src/@types/finder";
import { readFileSync, writeFileSync } from "fs";
import jcs from "jscodeshift";

let pipeline: InjectionPipeline;
const currSnapLocation = "tests/snapshots/current.snapshot";

beforeAll(() => {
  pipeline = new InjectionPipeline("tests/test.template.tsx");
});

afterAll(() => {
  const currentSnapshot = pipeline._ast!.toSource();
  try {
    const prevSnapshot = readFileSync(currSnapLocation);
    writeFileSync("tests/snapshots/previous.snapshot", prevSnapshot);
    writeFileSync(currSnapLocation, currentSnapshot);
  } catch (error) {
    writeFileSync(currSnapLocation, currentSnapshot);
  }
});

function testSourceForInjection(
  stringSourceShouldHave: string,
  testType: "toBeTruthy" | "toBeFalsy",
  opts?: { updates?: string; log?: boolean }
) {
  let updates = opts?.updates;
  if (!updates) updates = pipeline._ast?.toSource() || "";
  if (opts?.log) console.log(updates);
  expect(updates.includes(stringSourceShouldHave))[testType]();
  return updates;
}

describe("injectTSTypeLiteral", () => {
  const finderName = "TestTypeLiteral";
  test("Should inject property cat into TestTypeLiteral literal type", () => {
    const stageOptions: StageOptions<"tsTypeLiteral"> = {
      stringTemplate: '{cat: "Jasmine"}'
    };
    const finderOptions: FinderOptions<"tsTypeLiteral"> = {
      name: finderName
    };
    pipeline.injectTSTypeLiteral(stageOptions, finderOptions);
    testSourceForInjection(
      `export type TestTypeLiteral = {
  testProperty: "test value";
  cat: "Jasmine";
};
`,
      "toBeTruthy"
    );
  });
});

describe("injectTSTypeAliasConditional", () => {
  const finderOptions: FinderOptions<"tsTypeAlias"> = {
    name: "TestConditionalType"
  };
  const stageOptions: StageOptions<"tsTypeAliasConditional"> = {
    extendee: "T",
    extender: "a",
    forceInject: true,
    trueClause: `"a"`
  };

  test("Should force inject ts type alias TestConditionalType", () => {
    pipeline.injectTSTypeAliasConditional(stageOptions, finderOptions);
    testSourceForInjection(
      'TestConditionalType<T> = T extends "a"',
      "toBeTruthy"
    );
  });

  test("Should add to conditional TestConditionalType T extends 'b' ? ", () => {
    const stageOptions: StageOptions<"tsTypeAliasConditional"> = {
      extendee: "T",
      extender: "b",
      trueClause: `"b"`
    };
    pipeline.injectTSTypeAliasConditional(stageOptions, finderOptions);
    testSourceForInjection(
      'TestConditionalType<T> = T extends "b"',
      "toBeTruthy"
    );
  });
});

describe("injectTSTypeAlias", () => {
  const finderOptions: FinderOptions<"tsTypeAlias"> = {
    name: "TestAlias"
  };
  const stageOptions: StageOptions<"tsTypeAlias"> = {
    type: "union",
    stringTemplate: `"d"`
  };

  test("Should inject 'd' as union type for TestAlias", () => {
    pipeline.injectTSTypeAlias(stageOptions, finderOptions);
    testSourceForInjection(
      `export type TestAlias = "a" | "b" | "c" | "d";`,
      "toBeTruthy"
    );
  });

  test("Should inject 'abcd' as intersection type for TestAlias", () => {
    pipeline.injectTSTypeAlias(
      { type: "intersection", stringTemplate: `"abcd"` },
      finderOptions
    );
    testSourceForInjection(
      `export type TestAlias = ("a" | "b" | "c" | "d") & "abcd";`,
      "toBeTruthy"
    );
  });

  test("Should overwrite TestAlias with new type", () => {
    pipeline.injectTSTypeAlias(
      { stringTemplate: `"a" | "b"`, type: "overwrite" },
      finderOptions
    );
    testSourceForInjection(`export type TestAlias = "a" | "b"`, "toBeTruthy");
  });
});

describe("injectTSInterfaceBody", () => {
  const finderOptions: FinderOptions<"tsInterfaceBody"> = {
    name: "TestInterface"
  };
  const stageOptions: StageOptions<"tsInterfaceBody"> = {
    bodyStringTemplate: `{
      hello: "world"
      number: 1
      items: []
      object: {}
    }`
  };

  test("Should inject the properties; hello, number, items and object to inteface TestInterface", () => {
    pipeline.injectTSInterfaceBody(stageOptions, finderOptions);
    testSourceForInjection(
      `export interface TestInterface {
  testProperty: "test value";
  hello: "world";
  number: 1;
  items: [];
  object: {};
}`,
      "toBeTruthy"
    );
  });
});

describe("injectTSEnumMember", () => {
  const finderOptions: FinderOptions<"tsEnum"> = {
    name: "TestEnum"
  };
  const stageOptions: StageOptions<"tsEnumMember"> = {
    key: "JEST_TEST",
    value: "JEST_TEST"
  };

  test("Should inject JEST_TEST key and value to TestEnum", () => {
    pipeline.injectTSEnumMember(stageOptions, finderOptions);
    testSourceForInjection(
      `export enum TestEnum {
  TEST_PROPERTY = "TEST_PROPERTY",
  JEST_TEST = "JEST_TEST"
}`,
      "toBeTruthy"
    );
  });
});

describe("injectSwitchCase", () => {
  const finderOptions: FinderOptions<"switch"> = {
    name: "testSwitch"
  };
  const stageOptions: StageOptions<"case"> = {
    caseName: "a",
    statements: [jcs.breakStatement()]
  };

  test('Should inject "a" case to switch statement that\'s testing testSwitch', () => {
    pipeline.injectSwitchCase(stageOptions, finderOptions);
    testSourceForInjection(
      `switch (testSwitch) {
case "a":
  break;
default:
  break;
}`,
      "toBeTruthy"
    );
  });
});

describe("injectStringTemplate", () => {
  const template = `

const jestStringTemplate = "hello from jest test";
console.log(jestStringTemplate);
`;
  const stageOptions: StageOptions<"stringTemplate"> = {
    template
  };

  test(`Should inject template: ${template}`, () => {
    pipeline.injectStringTemplate(stageOptions);
    testSourceForInjection(template, "toBeTruthy");
  });
});

describe("injectProperty", () => {
  const finderOptions: FinderOptions<"variableObject"> = {
    name: "testObject"
  };
  const stageOptions: StageOptions<"property"> = {
    property: {
      key: "jest",
      value: { nested: true, using: "ts", time: 0 }
    }
  };
  const expectedInjection = `const testObject = {
  jest: {
    nested: true,
    using: "ts",
    time: 0
  }`;
  test(`Should add property jest to testObject.`, () => {
    pipeline.injectProperty(stageOptions, finderOptions);
    testSourceForInjection(expectedInjection, "toBeTruthy");
  });
  const stageOptions2: StageOptions<"property"> = {
    property: "literal: new TestClass()"
  };
  const expectedInjection2 = `const testObject = {
  literal: new TestClass(),

  jest: {
    nested: true,
    using: "ts",
    time: 0
  }`;
  test(`Should add property literal as a jcs literal to testObject`, () => {
    pipeline.injectProperty(stageOptions2, finderOptions);
    testSourceForInjection(expectedInjection2, "toBeTruthy");
  });
});

describe("injectNamedExportProperty", () => {
  const stageOptions: StageOptions<"namedExportProperty"> = {
    name: "testArray"
  };
  const expectedInjection = `export { testObject, testArray };`;
  test(`Should add testArray to undeclared export object.`, () => {
    pipeline.injectNamedExportProperty(stageOptions);
    testSourceForInjection(expectedInjection, "toBeTruthy");
  });
});

describe("injectImport", () => {
  test(`Should add a default import to the top of the file.`, () => {
    const stageOptions: StageOptions<"import"> = {
      importName: "testImportDefaultConst",
      source: "./test.import2",
      isDefault: true
    };
    const expectedInjection = `import testImportDefaultConst from "./test.import2"`;
    pipeline.injectImport(stageOptions);
    testSourceForInjection(expectedInjection, "toBeTruthy");
  });

  test(`Should add a named import to the previous default import source`, () => {
    const stageOptions: StageOptions<"import"> = {
      importName: "testImportConst",
      source: "./test.import2"
    };
    const expectedInjection = `import testImportDefaultConst, { testImportConst } from "./test.import2"`;
    pipeline.injectImport(stageOptions);
    testSourceForInjection(expectedInjection, "toBeTruthy");
  });
});

describe("injectArrayElement", () => {
  const finderOptions: FinderOptions<"variableArray"> = { name: "testArray" };
  const stageOptions: StageOptions<"arrayElement"> = {
    value: { hello: "world" },
    identifier: false
  };
  const expectedInjection = `const testArray = ["test value", {
  hello: "world"
}];`;
  test(`Should add an element to the array "testArray".`, () => {
    pipeline.injectArrayElement(stageOptions, finderOptions);
    testSourceForInjection(expectedInjection, "toBeTruthy");
  });
});

describe("injectClassMethod", () => {
  const finderOptions: FinderOptions<"classBody"> = { name: "TestClass" };
  const stageOptions: StageOptions<"classMember"> = {
    stringTemplate: `protected _jestProperty: string | undefined;
  public set jestProperty(name: string){
    this._jestProperty = name;
  }
  public get jestProperty(){
    return this._jestProperty || "";
  }`
  };
  const expectedInjection = `class TestClass {
  private _testProperty: string = "test value";
  constructor() {}

  public testMethod(testArg: string) {
    return testArg;
  }
  protected _jestProperty: string | undefined;
  public set jestProperty(name: string){
    this._jestProperty = name;
  }
  public get jestProperty(){
    return this._jestProperty || "";
  }
}`;
  test(`Should add members to class TestClass`, () => {
    pipeline.injectClassMember(stageOptions, finderOptions);
    testSourceForInjection(expectedInjection, "toBeTruthy");
  });
});

describe("injectConstructor", () => {
  const finderOptions: FinderOptions<"classBody"> = { name: "TestClass" };
  const stageOptions: StageOptions<"classConstructor"> = {
    stringTemplate: `this._testProperty = "new value";`
  };
  const expectedInjection = `class TestClass {
  private _testProperty: string = "test value";
  constructor() {
    this._testProperty = "new value";
  }

  public testMethod(testArg: string) {
    return testArg;
  }
  protected _jestProperty: string | undefined;
  public set jestProperty(name: string){
    this._jestProperty = name;
  }
  public get jestProperty(){
    return this._jestProperty || "";
  }
}`;
  test(`Should add members to class TestClass`, () => {
    pipeline.injectClassConstructor(stageOptions, finderOptions);
    testSourceForInjection(expectedInjection, "toBeTruthy");
  });
});

describe("injectJSXElement", () => {
  const finderName = "TestElement";
  test("Should inject new child element TestElementChild into TestElement component", () => {
    const stageOptions: StageOptions<"jsxElement"> = {
      stringTemplate: "<React.Fragment></React.Fragment>"
    };
    const finderOptions: FinderOptions<"jsxElement"> = {
      name: finderName,
      attributeName: "title",
      attributeValue: { type: "StringLiteral", value: "test" }
    };
    pipeline.injectJSXElement(stageOptions, finderOptions);
    testSourceForInjection(
      `const TestComponent2 = () => <TestElement title="test"><React.Fragment></React.Fragment></TestElement>;`,
      "toBeTruthy"
    );
  });
});

describe("injectTSNamespace", () => {
  const finderName = "King";
  test("Should inject new typescript type 'Prince' to the ts namespace King", () => {
    const stageOptions: StageOptions<"tsNamespace"> = {
      stringTemplate: "type Prince = 'Agnes'"
    };
    const finderOptions: FinderOptions<"tsNamespace"> = {
      name: finderName
    };
    pipeline.injectTSNamespace(stageOptions, finderOptions);
    testSourceForInjection(
      `namespace King {
  type Prince = 'Agnes'
}`,
      "toBeTruthy"
    );
  });
  test("Should inject new typescript type 'Princess' to the ts namespace King", () => {
    const stageOptions: StageOptions<"tsNamespace"> = {
      stringTemplate: "export type Princess = 'Kali'"
    };
    const finderOptions: FinderOptions<"tsNamespace"> = {
      name: finderName
    };
    pipeline.injectTSNamespace(stageOptions, finderOptions);
    testSourceForInjection(
      `namespace King {
  type Prince = 'Agnes'
  export type Princess = 'Kali'
}`,
      "toBeTruthy"
    );
  });
  test("Should inject a new namespace called Queen", () => {
    const stageOptions: StageOptions<"tsNamespace"> = {
      stringTemplate: "",
      forceInject: true
    };
    const finderOptions: FinderOptions<"tsNamespace"> = {
      name: "Queen"
    };
    pipeline.injectTSNamespace(stageOptions, finderOptions);
    testSourceForInjection(
      `namespace Queen {
  
}`,
      "toBeTruthy"
    );
  });
});
describe("injectFunctionBody", () => {
  test("Should inject into function declaration body", () => {
    const finderOptions: FinderOptions<"function"> = { name: "funcDec" };
    const stageOptions: StageOptions<"functionBody"> = {
      stringTemplate: `const gg = true;`
    };
    const expectedInjection = "const gg = true;";
    pipeline.injectFunctionBody(stageOptions, finderOptions);
    testSourceForInjection(expectedInjection, "toBeTruthy");
  });
  test("Should inject into function expression body", () => {
    const finderOptions: FinderOptions<"function"> = { name: "funcExp" };
    const stageOptions: StageOptions<"functionBody"> = {
      stringTemplate: `const gg2 = false;`
    };
    const expectedInjection = "const gg2 = false;";
    pipeline.injectFunctionBody(stageOptions, finderOptions);
    testSourceForInjection(expectedInjection, "toBeTruthy");
  });
});
describe("injectReturnObjectProperty", () => {
  const finderOptions: FinderOptions<"function"> = { name: "funcDec" };
  const stageOptions: StageOptions<"returnObjectProperty"> = {
    stringTemplate: `gone`
  };
  const expectedInjection = `  return {
    ghost,
    gone`;
  test("Should inject return object properties into existing return object for function dclaration", () => {
    pipeline.injectReturnObjectProperty(stageOptions, finderOptions);
    testSourceForInjection(expectedInjection, "toBeTruthy");
  });

  const finderOptions2: FinderOptions<"function"> = { name: "funcExp" };
  const stageOptions2: StageOptions<"returnObjectProperty"> = {
    stringTemplate: `love`
  };
  const expectedInjection2 = `  return {
    love`;
  test("Should inject object return into function expression", () => {
    pipeline.injectReturnObjectProperty(stageOptions2, finderOptions2);
    testSourceForInjection(expectedInjection2, "toBeTruthy");
  });
});
describe("injectImportsFromFile", () => {
  const finderOptions: FinderOptions<"import"> = {};
  const stageOptions: StageOptions<"importsFromFile"> = {
    origin: {
      type: "text",
      text: 'import fs from "fs";\nimport path from "path";\n'
    },
    all: true
  };
  const expectedInjection = 'import fs from "fs"';
  test("Should inject imports from file", () => {
    pipeline.injectImportsFromFile(stageOptions, finderOptions);
    testSourceForInjection(expectedInjection, "toBeTruthy");
  });
});
describe("injectReturnAllFunctionVariables", () => {
  const finderOptions: FinderOptions<"function"> = { name: "variablesReturn" };
  const stageOptions: StageOptions<"returnAllFunctionVariables"> = {};
  const expectedInjection = `  return {
    first,
    second,
    third
  };`;
  test("Should return all the variables in function variablesReturn", () => {
    pipeline.injectReturnAllFunctionVariables(stageOptions, finderOptions);
    testSourceForInjection(expectedInjection, "toBeTruthy");
  });
});
describe("injectFunctionParams", () => {
  const finderOptions: FinderOptions<"function"> = { name: "funcExp" };
  const stageOptions: StageOptions<"functionParams"> = {
    stringTemplate: "love: boolean, sanity?: false"
  };
  const expectedInjection = "function(love: boolean, sanity?: false)";
  test("Should inject params into function funcExp", () => {
    pipeline.injectFunctionParams(stageOptions, finderOptions);
    testSourceForInjection(expectedInjection, "toBeTruthy");
  });
});
describe("injectObjectForAccessors", () => {
  const stageOptions: StageOptions<"objectForAccessors"> = {
    objectName: "testObject",
    accessors: ["testProperty", "testProperty2"]
  };
  const expectedInjection = "testObject.testProperty";
  test("Should inject 'testObject' before accessors 'testProperty' & 'testProperty'", () => {
    pipeline.injectObjectForAccessors(stageOptions);
    testSourceForInjection(expectedInjection, "toBeTruthy");
  });
});
describe("injectToProgram", () => {
  const finderOptions: FinderOptions<"program"> = {};
  // define stage options here
  const stageOptions: StageOptions<"program"> = {
    stringTemplate: "export type GangGang = { lethal: true, sexy: true }"
  };
  const expectedInjection = "export type GangGang";
  test("Should inject to Program successfully", () => {
    pipeline.injectToProgram(stageOptions, finderOptions);
    testSourceForInjection(expectedInjection, "toBeTruthy");
  });
});
describe("injectReturnStatement", () => {
  const finderOptions: FinderOptions<"function"> = { name: "injectReturnFunc" };
  // define stage options here
  const stageOptions: StageOptions<"returnStatement"> = {
    stringTemplate: "isReturned"
  };
  const expectedInjection = "return isReturned";
  test("Should ", () => {
    pipeline.injectReturnStatement(stageOptions, finderOptions);
    testSourceForInjection(expectedInjection, "toBeTruthy");
  });
});
