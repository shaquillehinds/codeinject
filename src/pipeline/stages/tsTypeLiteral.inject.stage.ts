import { Collection, JSCodeshift, TSTypeLiteral } from "jscodeshift";
import { DebugLogger } from "@utils/Logger";
import { StageOptionsAndIdName } from "@src/@types/stage";
import injectToProgram from "@src/utils/injectToProgram.inject";

const log = DebugLogger("tsTypeLiteral.inject.stage.ts");
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
  {
    stringTemplate,
    col,
    idName,
    forceInject
  }: StageOptionsAndIdName<"tsTypeLiteral">
) {
  if (!col) {
    log("error", "No expression collection passed to this stage.");
    return workingSource;
  }
  const colSize = col.size();

  if (colSize === 0 && !forceInject)
    log("error", `Type alias ${idName} was not found.`);

  const template = `type Template = ${stringTemplate}`;
  const ast = jcs.withParser("tsx")(template);
  const body = ast.find(jcs.TSTypeLiteral).paths()[0].value;
  const tsTypeLiteral = col.paths()[0].value;

  if (colSize !== 0) {
    for (let signature in body.members)
      tsTypeLiteral.members.push(body.members[signature]);
    col.forEach(p => p.replace(tsTypeLiteral));
  } else {
    injectToProgram(workingSource, [
      {
        statement: jcs.exportNamedDeclaration(
          jcs.tsTypeAliasDeclaration(jcs.identifier(idName), tsTypeLiteral)
        )
      }
    ]);
  }

  return workingSource;
}
