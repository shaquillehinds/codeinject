import { JSCodeshift } from "jscodeshift";

export default function arrayVariableFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: VariableArrayFinderOptions
) {
  return collection
    .find(jcs.Identifier, { name })
    .closest(jcs.VariableDeclaration)
    .find(jcs.ArrayExpression);
}
