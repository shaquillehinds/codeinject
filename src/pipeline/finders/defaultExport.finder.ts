import { Collection, JSCodeshift } from "jscodeshift";

export default function exportDefaultFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>
) {
  return collection.find(jcs.ExportDefaultDeclaration);
}
