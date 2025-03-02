import { ImportFinderOptions } from "@src/@types/finder";
import { Collection, JSCodeshift } from "jscodeshift";

export default function importFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  options: ImportFinderOptions
) {
  return collection.find(jcs.ImportDeclaration);
}
