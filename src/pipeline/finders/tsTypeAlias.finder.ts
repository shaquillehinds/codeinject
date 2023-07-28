import { Collection, JSCodeshift } from "jscodeshift";
import singleNodeCollectionValidator from "../validators/singleNodeCollection.finder.validator";
import { TSTypeAliasFinderOptions } from "@src/@types/finder";

export default function tsTypeAliasFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: TSTypeAliasFinderOptions
) {
  return singleNodeCollectionValidator(
    collection.find(jcs.TSTypeAliasDeclaration, {
      id: { type: "Identifier", name },
    }),
    "TSTypeAliasDeclaration"
  );
}
