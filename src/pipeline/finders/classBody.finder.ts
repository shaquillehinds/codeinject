import { Collection, JSCodeshift } from "jscodeshift";
import singleNodeCollectionValidator from "../validators/singleNodeCollection.finder.validator";
import { classBodyFinderOptions } from "@src/@types/finder";

export default function classBodyFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: classBodyFinderOptions
) {
  return singleNodeCollectionValidator(
    collection
      .find(jcs.ClassDeclaration, { id: { type: "Identifier", name } })
      .find(jcs.ClassBody),
    "ClassBody"
  );
}
