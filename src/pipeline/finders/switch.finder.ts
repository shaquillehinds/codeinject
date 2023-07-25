import { Collection, JSCodeshift } from "jscodeshift";

export default function switchFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: SwitchFinderOptions
) {
  const split = name.split(".");
  return collection
    .find(jcs.Identifier, { name: split[split.length - 1] })
    .closest(jcs.SwitchStatement);
}
