import { Collection, JSCodeshift } from "jscodeshift";
import singleNodeCollectionValidator from "../validators/singleNodeCollection.finder.validator";
import { TSEnumFinderOptions } from "@src/@types/finder";

export default function tsEnumFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: TSEnumFinderOptions
) {
  return singleNodeCollectionValidator(
    collection.find(jcs.TSEnumDeclaration, {
      id: { type: "Identifier", name },
    }),
    "TSEnumDeclaration"
  );
}
