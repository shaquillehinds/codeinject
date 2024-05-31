import { Collection, JSCodeshift } from "jscodeshift";
import { JSXAttributeKind, JSXOpeningElementKind } from "ast-types/gen/kinds";
import { JSXElementFinderOptions } from "@src/@types/finder";
import optionalNodeCollectionValidator from "../validators/optionalNodeCollection.finder.validator";

export default function jsxElementFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name, attributeName, attributeValue }: JSXElementFinderOptions
) {
  name = name;
  let attribute: Partial<JSXAttributeKind> | undefined;
  if (attributeName || attributeValue) {
    attribute = { type: "JSXAttribute" };
    attributeName
      ? (attribute.name = { type: "JSXIdentifier", name: attributeName })
      : //@ts-ignore
        (attribute.value = {
          value: attributeValue!.value,
          type: attributeValue!.type
        });
  }

  const openingElement: Partial<JSXOpeningElementKind> = {
    type: "JSXOpeningElement"
  };
  if (name) {
    const [object, property] = name.split(".");
    if (property)
      openingElement.name = {
        type: "JSXMemberExpression",
        property: { type: "JSXIdentifier", name: property },
        object: { type: "JSXIdentifier", name: object }
      };
    else openingElement.name = { type: "JSXIdentifier", name: object };
  }
  if (attribute) openingElement.attributes = [attribute as JSXAttributeKind];

  return optionalNodeCollectionValidator(
    collection.find(jcs.JSXElement, {
      openingElement
    }),
    name || attributeName || "Unknown"
  );
}
