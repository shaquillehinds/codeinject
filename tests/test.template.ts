import { finderTestConst } from "./test.import";

class TestClass {
  private _testProperty: string = "test value";
  constructor() {}

  public testMethod(testArg: string) {
    return testArg;
  }
}

const testObject = {
  testProperty: "test value"
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
