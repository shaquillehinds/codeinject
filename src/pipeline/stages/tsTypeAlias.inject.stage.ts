import {
  Collection,
  JSCodeshift,
  TSIntersectionType,
  TSTypeAliasDeclaration,
  TSUnionType,
} from "jscodeshift";
import { TSTypeKind } from "ast-types/gen/kinds";
/**
 *
 * @param options.stringTemplate - Provide type signature in a template string
 * @example
 * ```
 * (`
 *   CustomType | "someAlias"
 * `)
 * ```
 */
export default function injectTSTypeAliasStage<T extends "tsTypeAlias">(
  jcs: JSCodeshift,
  workingSource: Collection,
  { type, stringTemplate, col }: StageOptions<T>
) {
  if (!col) {
    console.error("No expression collection passed to injectTSTypeAliasStage");
    return workingSource;
  }
  const template = `type Template = ${stringTemplate}`;
  const ast = jcs.withParser("tsx")(template);
  const tsType = ast.find(jcs.TSTypeAliasDeclaration).get().value
    .typeAnnotation as TSTypeKind;
  const tsTypeAlias = col.get().value as TSTypeAliasDeclaration;
  const isUnion = tsTypeAlias.typeAnnotation.type === "TSUnionType";
  const isIntersection =
    tsTypeAlias.typeAnnotation.type === "TSIntersectionType";
  switch (type) {
    case "union": {
      if (isUnion) {
        const unionCol = col.find(jcs.TSUnionType);
        const union = unionCol.get().value as TSUnionType;
        union.types.push(tsType);
        unionCol.forEach((u) => u.replace(union));
      } else {
        let prevType = tsTypeAlias.typeAnnotation;
        if (isIntersection) {
          prevType = jcs.tsParenthesizedType(prevType);
        }
        const union = jcs.tsUnionType([prevType, tsType]);
        const newTypeDec = jcs.tsTypeAliasDeclaration(
          col.get().value.id,
          union
        );
        col.replaceWith(newTypeDec);
      }
      break;
    }
    case "unionGroup": {
      const union = jcs.tsUnionType([
        jcs.tsParenthesizedType(tsTypeAlias.typeAnnotation),
        tsType,
      ]);
      const newTypeDec = jcs.tsTypeAliasDeclaration(col.get().value.id, union);
      col.replaceWith(newTypeDec);
      break;
    }
    case "intersection": {
      if (isIntersection) {
        const interCol = col.find(jcs.TSIntersectionType);
        const intersection = interCol.get().value as TSIntersectionType;
        intersection.types.push(tsType);
        interCol.forEach((i) => i.replace(intersection));
      } else {
        let prevType = tsTypeAlias.typeAnnotation;
        if (isUnion) {
          prevType = jcs.tsParenthesizedType(prevType);
        }
        const intersection = jcs.tsIntersectionType([prevType, tsType]);
        const newTypeDec = jcs.tsTypeAliasDeclaration(
          col.get().value.id,
          intersection
        );
        col.replaceWith(newTypeDec);
      }
      break;
    }
    case "intersectionGroup": {
      const intersection = jcs.tsIntersectionType([
        jcs.tsParenthesizedType(tsTypeAlias.typeAnnotation),
        tsType,
      ]);
      const newTypeDec = jcs.tsTypeAliasDeclaration(
        col.get().value.id,
        intersection
      );
      col.replaceWith(newTypeDec);
      break;
    }
    default:
      const newTypeDec = jcs.tsTypeAliasDeclaration(col.get().value.id, tsType);
      col.replaceWith(newTypeDec);
      break;
  }

  return workingSource;
}
