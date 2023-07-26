import { Collection, JSCodeshift } from "jscodeshift";

export default function exportFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>
) {
  return collection.find(jcs.ExportNamedDeclaration);
}
