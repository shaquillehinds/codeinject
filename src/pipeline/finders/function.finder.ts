import {
  ArrowFunctionExpression,
  Collection,
  FunctionDeclaration,
  FunctionExpression,
  JSCodeshift
} from "jscodeshift";
import singleNodeCollectionValidator from "../validators/singleNodeCollection.finder.validator";
import { FunctionFinderOptions } from "@src/@types/finder";

export default function functionFinder<T>(
  jcs: JSCodeshift,
  collection: Collection<T>,
  options: FunctionFinderOptions
) {
  const decCol = collection
    .find(jcs.Identifier, { name: options.name })
    .closest(jcs.Declaration);

  if (decCol.get().value.type === "VariableDeclaration") {
    const funcExpCol = decCol.find(jcs.Function) as Collection<
      FunctionExpression | ArrowFunctionExpression
    >;
    return singleNodeCollectionValidator(funcExpCol, "FunctionExpression");
  } else {
    const funcDecCol = decCol as unknown as Collection<FunctionDeclaration>;
    return singleNodeCollectionValidator(funcDecCol, "FunctionDeclaration");
  }
}
