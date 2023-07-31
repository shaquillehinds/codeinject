import { Collection, JSCodeshift } from "jscodeshift";
import singleNodeCollectionValidator from "../validators/singleNodeCollection.finder.validator";
import { SwitchFinderOptions } from "@src/@types/finder";

export default function switchFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: SwitchFinderOptions
) {
  const split = name.split(".");
  return singleNodeCollectionValidator(
    collection
      .find(jcs.Identifier, { name: split[split.length - 1] })
      .closest(jcs.SwitchStatement),
    name
  );
}
