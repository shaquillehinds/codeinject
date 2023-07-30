import { Collection, JSCodeshift } from "jscodeshift";
import { TSEnumFinderOptions } from "@src/@types/finder";
import optionalNodeCollectionValidator from "../validators/optionalNodeCollection.finder.validator";

export default function tsEnumFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: TSEnumFinderOptions
) {
  return optionalNodeCollectionValidator(
    collection.find(jcs.TSEnumDeclaration, {
      id: { type: "Identifier", name }
    }),
    name
  );
}
