import { JSCodeshift } from "jscodeshift";

export default function variableObjectFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: VariableObjectFinderOptions
) {
  return collection
    .find(jcs.Identifier, { name })
    .closest(jcs.VariableDeclaration)
    .find(jcs.ObjectExpression);
}
