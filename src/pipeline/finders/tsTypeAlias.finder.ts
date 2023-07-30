import { Collection, JSCodeshift } from "jscodeshift";
import { TSTypeAliasFinderOptions } from "@src/@types/finder";
import optionalNodeCollectionValidator from "../validators/optionalNodeCollection.finder.validator";

export default function tsTypeAliasFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: TSTypeAliasFinderOptions
) {
  return optionalNodeCollectionValidator(
    collection.find(jcs.TSTypeAliasDeclaration, {
      id: { type: "Identifier", name }
    }),
    name
  );
}
