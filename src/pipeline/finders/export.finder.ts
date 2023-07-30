import { Collection, JSCodeshift } from "jscodeshift";
import optionalNodeCollectionValidator from "../validators/optionalNodeCollection.finder.validator";

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
  collection: Collection<T>
) {
  return optionalNodeCollectionValidator(
    collection.find(jcs.ExportNamedDeclaration, { declaration: null }),
    "ExportNamedCollection"
  );
}
