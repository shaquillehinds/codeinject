import { Collection } from "jscodeshift";

export default function singleNodeCollectionValidator<T>(
  collection: Collection<T>,
  collectionName: string
) {
  const col = collection.filter((e, i) => i === 0);
  if (!col.size())
    throw new Error(
      `The collection ${collectionName} is empty, can't use in stage`
    );
  return col;
}
