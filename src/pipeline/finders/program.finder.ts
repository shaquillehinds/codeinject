import { Collection, JSCodeshift } from "jscodeshift";

export default function programFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>
) {
  return collection.find(jcs.Program);
}
