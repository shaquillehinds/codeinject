import { Collection, JSCodeshift } from "jscodeshift";
import objToExp from "../parsers/objToExp.parser";
import { DebugLogger } from "@utils/Logger";
import { StageOptionsAndIdName } from "@src/@types/stage";

const log = DebugLogger("property.inject.stage.ts");

export default function injectPropertyStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { key, value, col }: StageOptionsAndIdName<"property">
) {
  if (!col) {
    log("error", "No expression collection passed to this stage.");
    return workingSource;
  }

  const properties = col.get(0)?.node.properties || [];

  const objExp = objToExp(jcs, { [key]: value });

  for (let prop of properties) objExp.properties.push(prop);

  col.get().replace(objExp);

  return workingSource;
}
