import { Collection, JSCodeshift } from "jscodeshift";
import singleNodeCollectionValidator from "../validators/singleNodeCollection.finder.validator";
import { VariableObjectFinderOptions } from "@src/@types/finder";

export default function variableObjectFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: VariableObjectFinderOptions
) {
  return singleNodeCollectionValidator(
    collection
      .find(jcs.Identifier, { name })
      .closest(jcs.VariableDeclaration)
      .find(jcs.ObjectExpression),
    "ObjectExpression"
  );
}
