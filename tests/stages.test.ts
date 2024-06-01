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
  updates?: string
) {
  if (!updates) updates = pipeline._ast?.toSource() || "";
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

  test("Should overwrite TestAlias with new type reference 'Alphabet'", () => {
    pipeline.injectTSTypeAlias(
      { stringTemplate: `Alphabet`, type: "overwrite" },
      finderOptions
    );
    testSourceForInjection(`export type TestAlias = Alphabet;`, "toBeTruthy");
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
  },

  testProperty: "test value"
};`;
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
  },

  testProperty: "test value"
};`;
  test(`Should add property literal as a jcs literal to testObject`, () => {
    pipeline.injectProperty(stageOptions2, finderOptions);
    testSourceForInjection(expectedInjection2, "toBeTruthy");
  });
});

describe("injectNamedExportProperty", () => {
  const stageOptions: StageOptions<"namedExportProperty"> = {
    name: "TestAlias"
  };
  const expectedInjection = `export { testObject, testArray, TestAlias };`;
  test(`Should add TestAlias to undeclared export object.`, () => {
    pipeline.injectNamedExportProperty(stageOptions);
    testSourceForInjection(expectedInjection, "toBeTruthy");
  });
});

describe("injectImport", () => {
  test(`Should add a default import to the top of the file.`, () => {
    const stageOptions: StageOptions<"import"> = {
      importName: "testImportDefaultConst",
      source: "./test.import",
      isDefault: true
    };
    const expectedInjection = `import testImportDefaultConst from "./test.import";`;
    pipeline.injectImport(stageOptions);
    testSourceForInjection(expectedInjection, "toBeTruthy");
  });

  test(`Should add a named import to the top of the file.`, () => {
    const stageOptions: StageOptions<"import"> = {
      importName: "testImportConst",
      source: "./test.import"
    };
    const expectedInjection = `import { testImportConst } from "./test.import";`;
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
    return this._jestProperty;
  }
    `
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
    return this._jestProperty;
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
    return this._jestProperty;
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
      stringTemplate: "<TestElementChild></TestElementChild>"
    };
    const finderOptions: FinderOptions<"jsxElement"> = {
      name: finderName,
      attributeName: "title",
      attributeValue: { type: "StringLiteral", value: "test" }
    };
    pipeline.injectJSXElement(stageOptions, finderOptions);
    testSourceForInjection(
      `const TestComponent2 = () => <TestElement title="test"><TestElementChild></TestElementChild></TestElement>;`,
      "toBeTruthy"
    );
  });
});
