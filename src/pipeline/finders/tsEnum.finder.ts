import { Collection, JSCodeshift } from "jscodeshift";
import singleNodeCollectionValidator from "../validators/singleNodeCollection.validator";

export default function tsEnumFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: TSEnumFinderOptions
) {
  return singleNodeCollectionValidator(
    collection.find(jcs.Identifier, { name }).closest(jcs.TSEnumDeclaration),
    "TSEnumDeclaration"
  );
}
