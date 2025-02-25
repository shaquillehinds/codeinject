import { Collection, JSCodeshift } from "jscodeshift";
import emptyCollectionValidator from "../validators/emptyCollection.finder.validator";
import { ProgramFinderOptions } from "@src/@types/finder";

export default function programFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  options: ProgramFinderOptions
) {
  return emptyCollectionValidator(collection.find(jcs.Program), "Program");
}
