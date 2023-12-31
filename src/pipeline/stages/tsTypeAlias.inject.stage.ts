import {
  Collection,
  JSCodeshift,
  TSIntersectionType,
  TSTypeAliasDeclaration,
  TSUnionType
} from "jscodeshift";
import { TSTypeKind } from "ast-types/gen/kinds";
import { DebugLogger } from "@utils/Logger";
import { StageOptionsAndIdName } from "@src/@types/stage";
import injectToProgram from "@src/utils/injectToProgram.inject";

const log = DebugLogger("tsTypeAlias.inject.stage.ts");
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
  options: StageOptionsAndIdName<T>
) {
  const { col, stringTemplate, forceInject, idName, type } = options;
  if (!col) {
    log("error", "No expression collection passed to this stage.");
    return workingSource;
  }

  const template = `type Template = ${stringTemplate}`;
  const ast = jcs.withParser("tsx")(template);
  const tsType = ast.find(jcs.TSTypeAliasDeclaration).get().value
    .typeAnnotation as TSTypeKind;

  if (col.size() === 0) {
    if (!forceInject) log("error", `Type alias ${idName} was not found.`);
    injectToProgram(workingSource, [
      {
        statement: jcs.exportNamedDeclaration(
          jcs.tsTypeAliasDeclaration(jcs.identifier(idName), tsType)
        )
      }
    ]);
    return workingSource;
  }

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
        unionCol.forEach(u => u.replace(union));
      } else {
        let prevType = tsTypeAlias.typeAnnotation;
        if (isIntersection) {
          prevType = jcs.tsParenthesizedType(prevType);
        }
        const union = jcs.tsUnionType([prevType, tsType]);
        const newTypeDec = jcs.tsTypeAliasDeclaration.from({
          typeParameters: col.get().value.typeParameters,
          id: col.get().value.id,
          typeAnnotation: union
        });
        col.replaceWith(newTypeDec);
      }
      break;
    }
    case "unionGroup": {
      const union = jcs.tsUnionType([
        jcs.tsParenthesizedType(tsTypeAlias.typeAnnotation),
        tsType
      ]);
      const newTypeDec = jcs.tsTypeAliasDeclaration.from({
        typeParameters: col.get().value.typeParameters,
        id: col.get().value.id,
        typeAnnotation: union
      });
      col.replaceWith(newTypeDec);
      break;
    }
    case "intersection": {
      if (isIntersection) {
        const interCol = col.find(jcs.TSIntersectionType);
        const intersection = interCol.get().value as TSIntersectionType;
        intersection.types.push(tsType);
        interCol.forEach(i => i.replace(intersection));
      } else {
        let prevType = tsTypeAlias.typeAnnotation;
        if (isUnion) {
          prevType = jcs.tsParenthesizedType(prevType);
        }
        const intersection = jcs.tsIntersectionType([prevType, tsType]);
        const newTypeDec = jcs.tsTypeAliasDeclaration.from({
          typeParameters: col.get().value.typeParameters,
          id: col.get().value.id,
          typeAnnotation: intersection
        });
        col.replaceWith(newTypeDec);
      }
      break;
    }
    case "intersectionGroup": {
      const intersection = jcs.tsIntersectionType([
        jcs.tsParenthesizedType(tsTypeAlias.typeAnnotation),
        tsType
      ]);
      const newTypeDec = jcs.tsTypeAliasDeclaration.from({
        typeParameters: col.get().value.typeParameters,
        id: col.get().value.id,
        typeAnnotation: intersection
      });
      col.replaceWith(newTypeDec);
      break;
    }
    default:
      const newTypeDec = jcs.tsTypeAliasDeclaration.from({
        typeParameters: col.get().value.typeParameters,
        id: col.get().value.id,
        typeAnnotation: tsType
      });
      col.replaceWith(newTypeDec);
      break;
  }

  return workingSource;
}
