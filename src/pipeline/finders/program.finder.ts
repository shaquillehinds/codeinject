import { Collection, JSCodeshift } from "jscodeshift";
import emptyCollectionValidator from "../validators/emptyCollection.validator";

export default function programFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>
) {
  return emptyCollectionValidator(collection.find(jcs.Program), "Program");
}
