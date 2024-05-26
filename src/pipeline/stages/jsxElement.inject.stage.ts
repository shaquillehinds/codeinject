import { Collection, JSCodeshift, JSXElement } from "jscodeshift";
import { StageOptionsAndIdName } from "@src/@types/stage";
import { DebugLogger } from "@utils/Logger";

const log = DebugLogger("jsxElement.inject.stage.ts");

/**
 *
 * @param options.jsxElementTemplate - Provide jsx element signatures in a template string
 * @example
 * ```
 * (`{
 *  template: true
 * }`)
 * ```
 */
export default function injectJSXElementStage(
  jcs: JSCodeshift,
  workingSource: Collection,

  { stringTemplate, col }: StageOptionsAndIdName<"jsxElement">
) {
  if (!col) {
    log("error", "No expression collection passed to this stage.");
    return workingSource;
  }
  const ast = jcs.withParser("tsx")(stringTemplate);
  const childElement = ast.find(jcs.JSXElement).get().value as JSXElement;
  const parentElement = col.get().value as JSXElement;
  parentElement.children?.push(childElement);
  col.forEach(p => p.replace(parentElement));

  return workingSource;
}
