import { Collection, JSCodeshift } from "jscodeshift";
import singleNodeCollectionValidator from "../validators/singleNodeCollection.finder.validator";

export default function exportFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>
) {
  return singleNodeCollectionValidator(
    collection.find(jcs.ExportNamedDeclaration),
    "ExportNamedCollection"
  );
}
