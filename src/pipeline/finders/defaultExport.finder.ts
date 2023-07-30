import { Collection, JSCodeshift } from "jscodeshift";
import optionalNodeCollectionValidator from "../validators/optionalNodeCollection.finder.validator";

export default function exportDefaultFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>
) {
  return optionalNodeCollectionValidator(
    collection.find(jcs.ExportDefaultDeclaration),
    "ExportDefaultDeclaration"
  );
}
