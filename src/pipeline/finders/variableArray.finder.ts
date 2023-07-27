import { JSCodeshift } from "jscodeshift";
import singleNodeCollectionValidator from "../validators/singleNodeCollection.finder.validator";

export default function arrayVariableFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: VariableArrayFinderOptions
) {
  return singleNodeCollectionValidator(
    collection
      .find(jcs.Identifier, { name })
      .closest(jcs.VariableDeclaration)
      .find(jcs.ArrayExpression),
    "ArrayExpression"
  );
}
