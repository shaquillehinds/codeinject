import { Collection, JSCodeshift } from "jscodeshift";
import optionalNodeCollectionValidator from "../validators/optionalNodeCollection.finder.validator";
import { ExportFinderOptions } from "@src/@types/finder";

/**
 * Finds undeclared export
 *
 * @example
 * ```
 * export {
 *   example
 * }
 * ```
 */

export default function exportFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  options: ExportFinderOptions
) {
  return optionalNodeCollectionValidator(
    collection.find(jcs.ExportNamedDeclaration, { declaration: null }),
    "ExportNamedCollection"
  );
}
