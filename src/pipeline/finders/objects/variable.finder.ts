import { JSCodeshift } from "jscodeshift";

export default function variableObjectFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { variableName }: VariableObjectOptions
) {
  return collection
    .find(jcs.Identifier, { name: variableName })
    .closest(jcs.VariableDeclaration)
    .find(jcs.ObjectExpression);
}
