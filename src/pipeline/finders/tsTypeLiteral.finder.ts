import { Collection, JSCodeshift } from "jscodeshift";
import singleNodeCollectionValidator from "../validators/singleNodeCollection.validator";

export default function tsTypeLiteralFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: TSTypeLiteralFinderOptions
) {
  return singleNodeCollectionValidator(
    collection.find(jcs.Identifier, { name }).closest(jcs.TSTypeLiteral),
    "TSTypeLiteral"
  );
}
