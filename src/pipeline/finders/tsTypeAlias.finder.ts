import { Collection, JSCodeshift } from "jscodeshift";
import singleNodeCollectionValidator from "../validators/singleNodeCollection.finder.validator";

export default function tsTypeAliasFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: TSTypeAliasFinderOptions
) {
  return singleNodeCollectionValidator(
    collection
      .find(jcs.Identifier, { name })
      .closest(jcs.TSTypeAliasDeclaration),
    "TSTypeAliasDeclaration"
  );
}
