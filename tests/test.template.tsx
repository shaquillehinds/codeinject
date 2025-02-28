//@ts-nocheck

import React from "react";
import { finderTestConst } from "./test.import";

class TestClass {
  private _testProperty: string = "test value";
  constructor() {}

  public testMethod(testArg: string) {
    return testArg;
  }
}

const testObject = {
  testProperty: "test value",
  testProperty2: "test value 2"
};

const testArray = ["test value"];

export type TestTypeLiteral = {
  testProperty: "test value";
};

export type TestAlias = "a" | "b" | "c";

export interface TestInterface {
  testProperty: "test value";
}

export enum TestEnum {
  TEST_PROPERTY = "TEST_PROPERTY"
}

export { testObject, testArray };

export default TestClass;

const testSwitch: TestAlias = "a";

switch (testSwitch) {
  default:
    break;
}

type TestElementProps = { title: string };
const TestElement = (props: TestElementProps) => (
  <React.Fragment>{props.title}</React.Fragment>
);

const TestComponent2 = () => <TestElement title="test"></TestElement>;

const funcExp = function () {};

function funcDec() {
  const ghost = true;
  return { ghost };
}

function variablesReturn() {
  const first = 1;
  const second = "2";
  const third = true;
}

namespace King {}

testProperty;
testProperty2;
