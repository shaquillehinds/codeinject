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
      .find(jcs.TSInterfaceDeclaration, { id: { type: "Identifier", name } })
      .find(jcs.TSInterfaceBody),
    "TSInterfaceBody"
  );
}
