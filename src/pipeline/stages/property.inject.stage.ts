import {
  Collection,
  JSCodeshift,
  ObjectExpression,
  Property
} from "jscodeshift";
import objToExp from "../parsers/objToExp.parser";
import { DebugLogger } from "@utils/Logger";
import { StageOptionsAndIdName } from "@src/@types/stage";

const log = DebugLogger("property.inject.stage.ts");

export default function injectPropertyStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { col, property }: StageOptionsAndIdName<"property">
) {
  if (!col) {
    log("error", "No expression collection passed to this stage.");
    return workingSource;
  }

  const properties = col.get(0)?.node.properties || [];

  if (typeof property === "string") {
    const ast2 = jcs.withParser("tsx")(
      `const template = {
      ${property}
     }
    `
    );
    const col2 = ast2.find(jcs.ObjectExpression);
    const newProperty = col2.get().value as ObjectExpression;

    const objExp = jcs.objectExpression([
      newProperty.properties[0],
      ...properties
    ]);

    col.get().replace(objExp);
  } else {
    const objExp = objToExp(jcs, { [property.key]: property.value });

    for (let prop of properties) objExp.properties.push(prop);

    col.get().replace(objExp);
  }

  return workingSource;
}
