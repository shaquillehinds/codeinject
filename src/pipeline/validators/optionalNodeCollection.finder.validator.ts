import { Collection } from "jscodeshift";

export default function optionalNodeCollectionValidator<T>(
  collection: Collection<T>,
  idName: string
) {
  const col = collection.filter((e, i) => i === 0);
  return { idName, col };
}
