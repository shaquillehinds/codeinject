import { describe, expect, test } from "@jest/globals";

describe("Test if jest is working properly", () => {
  test("1 + 1 should be 2", () => {
    expect(1 + 1).toBe(2);
  });
});
