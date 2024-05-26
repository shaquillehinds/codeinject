import { Collection, JSCodeshift } from "jscodeshift";
import { JSXElementFinderOptions } from "@src/@types/finder";
import optionalNodeCollectionValidator from "../validators/optionalNodeCollection.finder.validator";

export default function jsxElementFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: JSXElementFinderOptions
) {
  const [object, property] = name.split(".");

  return optionalNodeCollectionValidator(
    collection.find(jcs.JSXElement, {
      openingElement: property
        ? {
            name: {
              type: "JSXMemberExpression",
              property: { type: "JSXIdentifier", name: property },
              object: { type: "JSXIdentifier", name: object }
            }
          }
        : { name: { type: "JSXIdentifier", name: object } }
    }),
    name
  );
}
