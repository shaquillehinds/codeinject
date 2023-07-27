import { Collection, JSCodeshift } from "jscodeshift";
import { TSTypeKind } from "ast-types/gen/kinds";
import stringToASTType from "../parsers/stringToASTType.parser";
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
  T extends "tsTypeAliasConditional",
>(
  jcs: JSCodeshift,
  workingSource: Collection,
  { trueClause, falseClause, extendee, extender, col }: StageOptions<T>
) {
  if (!col) {
    console.error(
      "No expression collection passed to injectTSTypeAliasConditionalStage"
    );
    return workingSource;
  }
  const template = `type Template = ${trueClause}`;
  const ast = jcs.withParser("tsx")(template);

  const trueType = ast.find(jcs.TSTypeAliasDeclaration).get().value
    .typeAnnotation as TSTypeKind;

  const checkType = jcs.tsTypeReference(jcs.identifier(extendee));

  const astType = stringToASTType(extender).type;
  const extendsType =
    astType.type === "Identifier"
      ? jcs.tsTypeReference(astType)
      : jcs.tsLiteralType(astType);

  let falseType: TSTypeKind;
  if (falseClause) {
    const template2 = `type Template = ${falseClause}`;
    const ast2 = jcs.withParser("tsx")(template2);
    falseType = ast2.find(jcs.TSTypeAliasDeclaration).get().value
      .typeAnnotation as TSTypeKind;
  } else falseType = col.find(jcs.TSConditionalType).get().value;

  const newConditionalType = jcs.tsConditionalType(
    checkType,
    extendsType,
    trueType,
    falseType
  );

  const typeAliasIdentifier = col.get().value.id;

  const newTypeAliasDeclaration = jcs.tsTypeAliasDeclaration.from({
    typeParameters: col.get().value.typeParameters,
    id: typeAliasIdentifier,
    typeAnnotation: newConditionalType,
  });

  col.replaceWith(newTypeAliasDeclaration);

  return workingSource;
}
