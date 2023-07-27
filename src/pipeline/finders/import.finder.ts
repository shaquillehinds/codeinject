import { Collection, JSCodeshift } from "jscodeshift";
import emptyCollectionValidator from "../validators/emptyCollection.validator";

export default function importFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>
) {
  return emptyCollectionValidator(
    collection.find(jcs.ImportDeclaration),
    "ImportDeclaration"
  );
}
