import { StatementKind } from "ast-types/gen/kinds";
import programFinder from "@src/pipeline/finders/program.finder";
import jcs, { Collection, Program, Statement } from "jscodeshift";
import { ProgramInjectPosition } from "@src/@types/stage";
import importFinder from "@src/pipeline/finders/import.finder";

export default function injectToProgram(
  ast: Collection,
  injections: {
    statement: StatementKind;
    injectionLine?: "last" | "first";
  }[]
) {
  const programCol = programFinder(jcs, ast, {}).col;

  programCol.forEach(path => {
    injections.forEach(({ statement, injectionLine }) => {
      injectionLine === "first"
        ? path.node.body.unshift(statement)
        : path.node.body.push(statement);
    });
  });
}

type Props = {
  col: Collection<Program>;
  nodes?: StatementKind[];
  position?: ProgramInjectPosition;
  workingSource: Collection;
  stringTemplate?: string;
};
export function injectToProgramV2({
  col,
  nodes,
  position,
  workingSource,
  stringTemplate
}: Props) {
  const templateNodes: StatementKind[] = stringTemplate
    ? jcs
        .withParser("tsx")(stringTemplate)
        .find(jcs.Program)
        .get()
        .value.body.filter((s: Statement) => jcs.Statement.check(s))
    : (nodes || []).filter((s: Statement) => jcs.Statement.check(s));

  if (!templateNodes) {
    console.warn($lf(48), "No nodes found to add to inject to program");
  }
  const astNodes: StatementKind[] = col
    .get()
    .value.body.filter((s: Statement) => jcs.Statement.check(s));
  // console.log($lf(53), astNodes);
  let newProgram: Program | undefined;
  switch (position) {
    case "afterImport": {
      const col = importFinder(jcs, workingSource, {});
      const size = col.size();
      if (size < 1) newProgram = jcs.program([...templateNodes, ...astNodes]);
      else {
        col.insertAfter((imp: any, i: number) =>
          i === size - 1 ? templateNodes : undefined
        );
      }
      break;
    }
    case "beforeImport": {
      const col = importFinder(jcs, workingSource, {});
      const size = col.size();
      if (size < 1) newProgram = jcs.program([...templateNodes, ...astNodes]);
      else {
        col.insertBefore((imp: any, i: number) =>
          i === 0 ? templateNodes : undefined
        );
      }
      break;
    }
    case "firstLine":
      newProgram = jcs.program([...templateNodes, ...astNodes]);
      break;
    default:
      newProgram = jcs.program([...astNodes, ...templateNodes]);
      break;
  }
  if (newProgram) col.replaceWith(newProgram);
}

function $lf(n: number) {
  return "$lf|src/utils/injectToProgram.inject.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
