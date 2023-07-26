import { Collection, JSCodeshift } from "jscodeshift";

export default function tsInterfaceBodyFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  { name }: InterfaceFinderBodyOptions
) {
  return collection
    .find(jcs.Identifier, { name })
    .closest(jcs.TSInterfaceDeclaration)
    .find(jcs.TSInterfaceBody);
}
