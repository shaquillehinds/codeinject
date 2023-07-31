import { Collection, JSCodeshift } from "jscodeshift";
import singleNodeCollectionValidator from "../validators/singleNodeCollection.finder.validator";
import { VariableArrayFinderOptions } from "@src/@types/finder";

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
    name
  );
}
