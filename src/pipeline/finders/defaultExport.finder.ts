import { Collection, JSCodeshift } from "jscodeshift";
import optionalNodeCollectionValidator from "../validators/optionalNodeCollection.finder.validator";
import { DefaultExportFinderOptions } from "@src/@types/finder";

export default function exportDefaultFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  options: DefaultExportFinderOptions
) {
  return optionalNodeCollectionValidator(
    collection.find(jcs.ExportDefaultDeclaration),
    "ExportDefaultDeclaration"
  );
}
