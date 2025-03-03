import { stderr } from "chalk";
import { Collection } from "jscodeshift";

export default function emptyCollectionValidator<T>(
  collection: Collection<T>,
  collectionName: string
) {
  if (!collection.size())
    throw new Error(
      stderr.redBright(
        `The collection ${collectionName} is empty, check your injection pipeline finder options. If everything looks good, there might be an issue with the finder function itself.`
      )
    );
  return { col: collection, idName: collectionName };
}
