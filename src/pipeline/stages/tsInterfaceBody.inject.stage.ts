import { Collection, JSCodeshift, TSInterfaceBody } from "jscodeshift";
import { DebugLogger } from "@utils/Logger";
import { StageOptionsAndIdName } from "@src/@types/stage";

const log = DebugLogger("tsInterfaceBody.inject.stage.ts");
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

  { bodyStringTemplate, col }: StageOptionsAndIdName<"tsInterfaceBody">
) {
  if (!col) {
    log("error", "No expression collection passed to this stage.");
    return workingSource;
  }
  const template = `interface Template ${bodyStringTemplate}`;
  const ast = jcs.withParser("tsx")(template);
  const body = ast.find(jcs.TSInterfaceBody).get().value as TSInterfaceBody;
  const tsInterfaceBody = col.get().value as TSInterfaceBody;
  for (let signature in body.body)
    tsInterfaceBody.body.push(body.body[signature]);
  col.forEach(p => p.replace(tsInterfaceBody));

  return workingSource;
}
