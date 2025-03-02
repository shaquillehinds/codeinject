import { Collection, JSCodeshift } from "jscodeshift";
import { ReturnFinderOptions } from "@src/@types/finder";
import emptyCollectionValidator from "../validators/emptyCollection.finder.validator";

export default function returnFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  options: ReturnFinderOptions
) {
  const filter = {
    argument: { type: options.argumentType }
  };
  return {
    col: collection.find(
      jcs.ReturnStatement,
      //@ts-ignore
      options.argumentType ? filter : undefined
      // { argument: { type: options.argumentType } }
    ),
    idName: "ReturnStatement"
  };
}
