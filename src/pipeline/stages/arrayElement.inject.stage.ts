import { Collection, JSCodeshift } from "jscodeshift";
import objToExp from "../parsers/objToExp.parser";
import arrToExp from "../parsers/arrToExp.parser";
import funcToExp from "../parsers/funcToExp.parser";
import { DebugLogger } from "@utils/Logger";

const log = DebugLogger("arrayElement.inject.stage.ts");

export default function injectArrayElementStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { value, identifier, col }: StageOptions<"arrayElement">
) {
  if (!col) {
    log("error", "No expression collection passed to this stage.");
    return workingSource;
  }
  let newElement;
  switch (typeof value) {
    case "object":
      if (value instanceof Array) newElement = arrToExp(jcs, value);
      else newElement = objToExp(jcs, value);
      break;
    case "function":
      newElement = funcToExp(jcs, value);
      break;
    default:
      if (identifier) newElement = jcs.identifier(value);
      else newElement = jcs.literal(value);
  }

  const elements = col.get().value.elements;

  const newArr = jcs.arrayExpression([...elements, newElement]);

  col.replaceWith(newArr);

  return workingSource;
}
