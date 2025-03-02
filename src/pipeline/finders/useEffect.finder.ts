import { Collection, JSCodeshift } from "jscodeshift";
import { UseEffectFinderOptions } from "@src/@types/finder";
import emptyCollectionValidator from "../validators/emptyCollection.finder.validator";

export default function useEffectFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  options: UseEffectFinderOptions
) {
  return emptyCollectionValidator(
    collection
      .find(jcs.Identifier, { name: "useEffect" })
      .closest(jcs.CallExpression),
    "CallExpression"
  );
}
