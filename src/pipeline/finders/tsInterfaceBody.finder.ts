import { Collection, JSCodeshift } from "jscodeshift";
import singleNodeCollectionValidator from "../validators/singleNodeCollection.finder.validator";
import { InterfaceFinderBodyOptions } from "@src/@types/finder";

export default function tsInterfaceBodyFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: InterfaceFinderBodyOptions
) {
  return singleNodeCollectionValidator(
    collection
      .find(jcs.Identifier, { name })
      .closest(jcs.TSInterfaceDeclaration)
      .find(jcs.TSInterfaceBody),
    "TSInterfaceBody"
  );
}
