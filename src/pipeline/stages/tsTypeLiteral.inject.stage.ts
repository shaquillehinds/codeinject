import { Collection, JSCodeshift, TSTypeLiteral } from "jscodeshift";
import { DebugLogger } from "@utils/Logger";
import { StageOptionsAndIdName } from "@src/@types/stage";
import injectToProgram from "@src/utils/injectToProgram.inject";
import addBrackets from "@src/utils/addBrackets";

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
    nodes,
    idName,
    forceInject
  }: StageOptionsAndIdName<"tsTypeLiteral">
) {
  if (!col) {
    console.warn($lf(30), "No expression collection passed to this stage.");
    return workingSource;
  }
  const colSize = col.size();

  if (colSize === 0 && !forceInject) {
    console.warn($lf(36), `Type alias ${idName} was not found.`);
    return workingSource;
  }

  if (!nodes && !stringTemplate) {
    console.warn(
      $lf(41),
      "No nodes or stringTemplate provided - injectTSTypeLiteral"
    );
    return workingSource;
  }

  if (!stringTemplate) {
    // todo add node injections
    return workingSource;
  }

  const template = `type Template = ${addBrackets(stringTemplate)}`;
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

function $lf(n: number) {
  return "$lf|pipeline/stages/tsTypeLiteral.inject.stage.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
