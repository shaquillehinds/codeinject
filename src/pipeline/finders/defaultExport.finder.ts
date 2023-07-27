import { Collection, JSCodeshift } from "jscodeshift";
import emptyCollectionValidator from "../validators/emptyCollection.finder.validator";

export default function exportDefaultFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>
) {
  return emptyCollectionValidator(
    collection.find(jcs.ExportDefaultDeclaration),
    "ExportDefaultDeclaration"
  );
}
