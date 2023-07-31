import { chalkStderr } from "chalk";
import { Collection } from "jscodeshift";

export default function singleNodeCollectionValidator<T>(
  collection: Collection<T>,
  collectionName: string
) {
  const col = collection.filter((e, i) => i === 0);
  if (!col.size())
    throw new Error(
      chalkStderr.redBright(
        `The collection ${collectionName} is empty, check your injection pipeline finder options. If everything looks good, there might be an issue with the finder function itself.`
      )
    );
  return { col, idName: collectionName };
}
