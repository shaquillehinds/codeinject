import { Collection, JSCodeshift } from "jscodeshift";
import objToExp from "../parsers/objToExp.parser";

export default function injectPropertyStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { key, value, col }: StageOptions<"property">
) {
  if (!col) {
    console.error("No expression collection passed to injectPropertyStage");
    return workingSource;
  }

  const properties = col.get(0)?.node.properties || [];

  const objExp = objToExp(jcs, { [key]: value });

  for (let prop of properties) objExp.properties.push(prop);

  col.get().replace(objExp);

  return workingSource;
}
