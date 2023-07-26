import { Collection, JSCodeshift, TSTypeLiteral } from "jscodeshift";
/**
 *
 * @param options.stringTemplate - Provide type literal signatures in a template string
 * @example
 * ```
 * (`{
 *  template: true
 * }`)
 * ```
 */
export default function injectTSTypeLiteralStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { stringTemplate, col }: StageOptions<"tsTypeLiteral">
) {
  if (!col) {
    console.error(
      "No expression collection passed to injectTSTypeLiteralStage"
    );
    return workingSource;
  }
  const template = `type Template = ${stringTemplate}`;
  const ast = jcs.withParser("tsx")(template);
  const body = ast.find(jcs.TSTypeLiteral).get().value as TSTypeLiteral;
  const tsTypeLiteral = col.get().value as TSTypeLiteral;
  for (let signature in body.members)
    tsTypeLiteral.members.push(body.members[signature]);
  col.forEach((p) => p.replace(tsTypeLiteral));

  return workingSource;
}
