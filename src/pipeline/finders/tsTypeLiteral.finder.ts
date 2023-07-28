import { Collection, JSCodeshift } from "jscodeshift";
import singleNodeCollectionValidator from "../validators/singleNodeCollection.finder.validator";
import { TSTypeLiteralFinderOptions } from "@src/@types/finder";

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
