import path from "path";
import fs from "fs";
//@ts-nocheck

import React from "react";
import testImportDefaultConst, { testImportConst } from "./test.import2";
import { finderTestConst } from "./test.import";

namespace Queen {}

class TestClass {
  private _testProperty: string = "test value";
  constructor() {
    this._testProperty = "new value";
  }

  public testMethod(testArg: string) {
    return testArg;
  }
  protected _jestProperty: string | undefined;
  public set jestProperty(name: string) {
    this._jestProperty = name;
  }
  public get jestProperty() {
    return this._jestProperty || "";
  }
}

const testObject = {
  literal: new TestClass(),

  jest: {
    nested: true,
    using: "ts",
    time: 0
  },

  testProperty: "test value",
  testProperty2: "test value 2"
};

const testArray = [
  "test value",
  {
    hello: "world"
  }
];

export type TestTypeLiteral = {
  testProperty: "test value";
  cat: "Jasmine";
};

export type TestAlias = "a" | "b";

export interface TestInterface {
  testProperty: "test value";
  hello: "world";
  number: 1;
  items: [];
  object: {};
}

export enum TestEnum {
  TEST_PROPERTY = "TEST_PROPERTY",
  JEST_TEST = "JEST_TEST"
}

export { testObject, testArray };

export default TestClass;

const testSwitch: TestAlias = "a";

switch (testSwitch) {
  case "a":
    break;
  default:
    break;
}

type TestElementProps = React.PropsWithChildren<{ title: string }>;
const TestElement = (props: TestElementProps) => (
  <React.Fragment>{props.children}</React.Fragment>
);

const TestComponent2 = () => (
  <TestElement title="test">
    <React.Fragment></React.Fragment>
  </TestElement>
);

const funcExp = function (love: boolean, sanity?: false) {
  const gg2 = false;

  return {
    love
  };
};

function funcDec() {
  const ghost = true;
  const gone = "girl";

  return {
    ghost,
    gone
  };

  const gg = true;
}

function variablesReturn() {
  const first = 1;
  const second = "2";
  const third = true;

  return {
    first,
    second,
    third
  };
}

namespace King {
  type Prince = "Agnes";
  export type Princess = "Kali";
}

testObject.testProperty;
testObject.testProperty2;
export type TestConditionalType<T> = T extends "b"
  ? "b"
  : T extends "a"
  ? "a"
  : undefined;

const jestStringTemplate = "hello from jest test";
console.log($lf(139), jestStringTemplate);

function $lf(n: number) {
  return "$lf|tests/snapshots/current.snapshot.tsx:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
