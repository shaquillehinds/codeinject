import { Collection, JSCodeshift } from "jscodeshift";
import { TSTypeLiteralFinderOptions } from "@src/@types/finder";
import optionalNodeCollectionValidator from "../validators/optionalNodeCollection.finder.validator";

export default function tsTypeLiteralFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: TSTypeLiteralFinderOptions
) {
  return optionalNodeCollectionValidator(
    collection
      .find(jcs.TSTypeAliasDeclaration, { id: { type: "Identifier", name } })
      .find(jcs.TSTypeLiteral),
    name
  );
}
