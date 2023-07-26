import { Collection, JSCodeshift } from "jscodeshift";

export default function importFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>
) {
  return collection.find(jcs.ImportDeclaration);
}
