import { Collection, JSCodeshift } from "jscodeshift";
import { TSNamespaceFinderOptions } from "@src/@types/finder";
import optionalNodeCollectionValidator from "../validators/optionalNodeCollection.finder.validator";

export default function tsNamespaceFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: TSNamespaceFinderOptions
) {
  return optionalNodeCollectionValidator(
    collection.find(jcs.TSModuleDeclaration, {
      id: { type: "Identifier", name }
    }),
    name
  );
}
