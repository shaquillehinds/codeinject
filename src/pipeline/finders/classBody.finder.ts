import { Collection, JSCodeshift } from "jscodeshift";
import singleNodeCollectionValidator from "../validators/singleNodeCollection.finder.validator";
import { classBodyFinderOptions } from "@src/@types/finder";

export default function classBodyFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  options: classBodyFinderOptions
) {
  return singleNodeCollectionValidator(
    collection
      .find(jcs.Identifier, options)
      .closest(jcs.ClassDeclaration)
      .find(jcs.ClassBody),
    "ClassBody"
  );
}
