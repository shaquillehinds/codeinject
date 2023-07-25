import { Collection, JSCodeshift } from "jscodeshift";

export default function tsEnumFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: TSEnumFinderOptions
) {
  return collection
    .find(jcs.Identifier, { name })
    .closest(jcs.TSEnumDeclaration);
}
