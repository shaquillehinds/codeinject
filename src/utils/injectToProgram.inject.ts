import { StatementKind } from "ast-types/gen/kinds";
import programFinder from "@src/pipeline/finders/program.finder";
import jcs, { Collection } from "jscodeshift";

export default function injectToProgram(
  ast: Collection,
  injections: {
    statement: StatementKind;
    injectionLine?: "last" | "first";
  }[]
) {
  const programCol = programFinder(jcs, ast).col;

  programCol.forEach(path => {
    injections.forEach(({ statement, injectionLine }) => {
      injectionLine === "first"
        ? path.node.body.unshift(statement)
        : path.node.body.push(statement);
    });
  });
}
