import { Collection, JSCodeshift } from "jscodeshift";
import { StageOptions } from "@src/@types/stage";
import functionFinder from "../finders/function.finder";
import { PatternKind } from "ast-types/gen/kinds";

export default function injectFunctionParamsStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { col, stringTemplate, nodes }: StageOptions<"functionParams">
) {
  if (!col) {
    console.warn($lf(12), "No expression collection passed to this stage.");
    return workingSource;
  }
  // params is PatternKind
  const prevParams = col.at(0).nodes()[0].params;
  let newParams: PatternKind[] = nodes ? nodes : [];

  if (stringTemplate) {
    const ast2 = jcs.withParser("tsx")(
      `function Template (${stringTemplate}){}
  `
    );
    const finderCol2 = functionFinder(jcs, ast2, { name: "Template" }).col;
    // newParams = finderCol2.at(0).nodes()[0].params
    newParams = finderCol2.at(0).nodes()[0].params;
  }
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
