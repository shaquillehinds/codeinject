import { Collection, JSCodeshift } from "jscodeshift";

export default function tsTypeAliasFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: TSTypeAliasFinderOptions
) {
  return collection
    .find(jcs.Identifier, { name })
    .closest(jcs.TSTypeAliasDeclaration)
    .filter((t, i) => i === 0);
}
