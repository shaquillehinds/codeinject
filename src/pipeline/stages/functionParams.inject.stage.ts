import { Collection, JSCodeshift } from "jscodeshift";
import { DebugLogger } from "@utils/Logger";
import { StageOptions } from "@src/@types/stage";
import functionFinder from "../finders/function.finder";

const log = DebugLogger("functionParams.inject.stage.ts");

export default function injectFunctionParamsStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { col, stringTemplate }: StageOptions<"functionParams">
) {
  if (!col) {
    log($lf(14), "error", "No expression collection passed to this stage.");
    return workingSource;
  }
  // params is PatternKind
  const prevParams = col.at(0).nodes()[0].params;
  const ast2 = jcs.withParser("tsx")(
    `function Template (${stringTemplate}){}
  `
  );
  const finderCol2 = functionFinder(jcs, ast2, { name: "Template" }).col;
  const newParams = finderCol2.at(0).nodes()[0].params;
  //@ts-ignore
  col.at(0).forEach(p => {
    p.node.params = [...prevParams, ...newParams];
    return p;
  });
  return workingSource;
}

function $lf(n: number) {
  return "$lf|pipeline/stages/functionParams.inject.stage.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
