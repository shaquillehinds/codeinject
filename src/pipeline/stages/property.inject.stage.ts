import { Collection, JSCodeshift } from "jscodeshift";

export default function injectPropertyStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { key, value, identifier, col }: StageOptions<"property">
) {
  if (!col) {
    console.error("No expression collection passed to injectPropertyStage");
    return workingSource;
  }

  const newProperty = jcs.objectProperty(
    jcs.identifier(key),
    identifier ? jcs.identifier(value) : jcs.literal(value)
  );

  const properties = col.get(0).node.properties;

  col.get().replace(jcs.objectExpression([...properties, newProperty]));

  return workingSource;
}
