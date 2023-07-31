import { Collection, JSCodeshift } from "jscodeshift";
import objToExp from "../parsers/objToExp.parser";
import arrToExp from "../parsers/arrToExp.parser";
import funcToExp from "../parsers/funcToExp.parser";
import { DebugLogger } from "@utils/Logger";
import { StageOptionsAndIdName } from "@src/@types/stage";
import { ExpressionKind } from "ast-types/gen/kinds";

const log = DebugLogger("arrayElement.inject.stage.ts");

export default function injectArrayElementStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { value, identifier, col }: StageOptionsAndIdName<"arrayElement">
) {
  if (!col) {
    log("error", "No expression collection passed to this stage.");
    return workingSource;
  }
  let newElement: ExpressionKind;
  switch (typeof value) {
    case "object":
      if (value instanceof Array) newElement = arrToExp(jcs, value);
      else newElement = objToExp(jcs, value);
      break;
    case "function":
      newElement = funcToExp(jcs, value) as ExpressionKind;
      break;
    default:
      if (identifier) newElement = jcs.identifier(value);
      else newElement = jcs.literal(value);
  }

  col.forEach(path => path.value.elements.push(newElement));

  return workingSource;
}
