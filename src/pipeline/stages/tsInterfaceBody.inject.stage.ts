import { Collection, JSCodeshift, TSInterfaceBody } from "jscodeshift";
/**
 *
 * @param options.bodyStringTemplate - Provide interface signatures in a template string
 * @example
 * ```
 * (`{
 *  template: true
 * }`)
 * ```
 */
export default function injectTSInterfaceBodyStage(
  jcs: JSCodeshift,
  workingSource: Collection,

  { bodyStringTemplate, col }: StageOptions<"tsInterfaceBody">
) {
  if (!col) {
    console.error(
      "No expression collection passed to injectTSInterfaceBodyStage"
    );
    return workingSource;
  }
  const template = `interface Template ${bodyStringTemplate}`;
  const ast = jcs.withParser("tsx")(template);
  const body = ast.find(jcs.TSInterfaceBody).get().value as TSInterfaceBody;
  const tsInterfaceBody = col.get().value as TSInterfaceBody;
  for (let signature in body.body)
    tsInterfaceBody.body.push(body.body[signature]);
  col.forEach((p) => p.replace(tsInterfaceBody));

  return workingSource;
}
