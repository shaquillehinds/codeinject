import { Collection, JSCodeshift, TSTypeAliasDeclaration } from "jscodeshift";
import { TSTypeKind } from "ast-types/gen/kinds";
import stringToASTType from "../parsers/stringToASTType.parser";
import { DebugLogger } from "@utils/Logger";
import { StageOptionsAndIdName } from "@src/@types/stage";
import injectToProgram from "@src/utils/injectToProgram.inject";

const log = DebugLogger("tsTypeAliasConditional.inject.stage.ts");
/**
 *
 * @param options.trueClause - Provide type signature in a template string
 * @example
 * ```
 * (`
 *   CustomType | "someAlias"
 * `)
 * ```
 */
export default function injectTSTypeAliasConditionalStage<
  T extends "tsTypeAliasConditional"
>(jcs: JSCodeshift, workingSource: Collection, opts: StageOptionsAndIdName<T>) {
  if (!opts.col) {
    log("error", "No expression collection passed to this stage.");
    return workingSource;
  }

  const colSize = opts.col.size();

  const template = `type Template = ${opts.trueClause}`;
  const ast = jcs.withParser("tsx")(template);

  const trueType = ast.find(jcs.TSTypeAliasDeclaration).get().value
    .typeAnnotation as TSTypeKind;

  const checkType = jcs.tsTypeReference(jcs.identifier(opts.extendee));

  const astType = stringToASTType(opts.extender).type;
  const extendsType =
    astType.type === "Identifier"
      ? jcs.tsTypeReference(astType)
      : jcs.tsLiteralType(astType);

  let falseType: TSTypeKind;
  if (opts.falseClause) {
    const template2 = `type Template = ${opts.falseClause}`;
    const ast2 = jcs.withParser("tsx")(template2);
    falseType = ast2.find(jcs.TSTypeAliasDeclaration).get().value
      .typeAnnotation as TSTypeKind;
  } else {
    const conditional = opts.col.find(jcs.TSConditionalType);
    if (conditional.size() !== 0) falseType = conditional.get().value;
    else {
      if (colSize !== 0)
        falseType = (opts.col.get().value as TSTypeAliasDeclaration)
          .typeAnnotation;
      falseType = jcs.tsUndefinedKeyword();
    }
  }

  const newConditionalType = jcs.tsConditionalType(
    checkType,
    extendsType,
    trueType,
    falseType
  );

  if (colSize === 0) {
    if (!opts.forceInject)
      log("error", `Type alias ${opts.idName} was not found.`);
    let constraint: TSTypeKind | undefined;
    if (opts.constraint)
      constraint = jcs.tsTypeReference(jcs.identifier(opts.constraint));
    injectToProgram(workingSource, [
      {
        statement: jcs.exportNamedDeclaration(
          jcs.tsTypeAliasDeclaration.from({
            id: jcs.identifier(opts.idName),
            typeAnnotation: newConditionalType,
            typeParameters: jcs.tsTypeParameterDeclaration([
              jcs.tsTypeParameter("T", constraint)
            ])
          })
        )
      }
    ]);
  } else {
    const typeAliasIdentifier = opts.col.get().value.id;
    const newTypeAliasDeclaration = jcs.tsTypeAliasDeclaration.from({
      typeParameters: opts.col.get().value.typeParameters,
      id: typeAliasIdentifier,
      typeAnnotation: newConditionalType
    });
    opts.col.replaceWith(newTypeAliasDeclaration);
  }

  return workingSource;
}
