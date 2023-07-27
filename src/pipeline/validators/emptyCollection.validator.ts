import { chalkStderr } from "chalk";
import { Collection } from "jscodeshift";

export default function emptyCollectionValidator<T>(
  collection: Collection<T>,
  collectionName: string
) {
  if (!collection.size())
    throw new Error(
      chalkStderr.redBright(
        `The collection "${collectionName}" is empty, can't use in stage`
      )
    );
  return collection;
}
