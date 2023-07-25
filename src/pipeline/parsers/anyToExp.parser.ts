import { JSCodeshift } from "jscodeshift";
import arrToExp from "./arrToExp.parser";
import objToExp from "./objToExp.parser";
import funcToExp from "./funcToExp.parser";

export default function anyToExp(jcs: JSCodeshift, value: any) {
  switch (typeof value) {
    case "object":
      if (value instanceof Array) return arrToExp(jcs, value);
      else return objToExp(jcs, value);
    case "function":
      return funcToExp(jcs, value);
    default:
      return jcs.literal(value);
  }
}
