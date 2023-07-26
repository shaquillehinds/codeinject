import { Collection, JSCodeshift } from "jscodeshift";

export default function tsTypeLiteralFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: TSTypeLiteralFinderOptions
) {
  return collection.find(jcs.Identifier, { name }).closest(jcs.TSTypeLiteral);
}
