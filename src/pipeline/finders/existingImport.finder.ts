import { ExistingImportFinderOptions } from "@src/@types/finder";
import { Collection, JSCodeshift } from "jscodeshift";

export default function existingImportFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { source }: ExistingImportFinderOptions
) {
  return collection.find(jcs.ImportDeclaration, { source: { value: source } });
}
