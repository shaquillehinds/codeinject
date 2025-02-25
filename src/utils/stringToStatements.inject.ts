//$lf-ignore
import programFinder from "@src/pipeline/finders/program.finder";
import jcs from "jscodeshift";
import { StatementKind } from "ast-types/gen/kinds";

/**
 *
 * @param string - Provide code program in string format
 * @example
 * ```
 * `
 *  const helloResponse = "world";
 *
 *  function hello(){
 *    console.log(helloResponse);
 *  }
 * `
 * ```
 */
export default function stringToStatements(str: string) {
  const ast = jcs.withParser("tsx")(str);

  const programCol = programFinder(jcs, ast, {}).col;
  let statements: StatementKind[] = [];
  programCol
    .paths()[0]
    .node.body.forEach(statement => statements.push(statement));

  return statements;
}
