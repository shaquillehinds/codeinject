import { Collection, JSCodeshift } from "jscodeshift";
import { StageOptions } from "@src/@types/stage";
import injectReturnObjectPropertyStage from "./returnObjectProperty.inject.stage";
import getDefinedVariableName from "@src/utils/getDefinedVariableName";

export default function injectReturnAllFunctionVariablesStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { col }: StageOptions<"returnAllFunctionVariables">
) {
  if (!col) {
    console.error($lf(12), "No expression collection passed to this stage.");
    return workingSource;
  }
  let variableNames = "";
  const defaultFunctionNodes = col
    .find(jcs.BlockStatement)
    .at(0)
    .nodes()[0].body;

  defaultFunctionNodes.forEach(statement => {
    const name = getDefinedVariableName(statement);
    if (name.length)
      variableNames += "," + (name.length > 1 ? name.join(",") : name[0]);
  });

  const stringTemplate = variableNames.slice(1);
  injectReturnObjectPropertyStage(jcs, workingSource, { stringTemplate, col });

  return workingSource;
}

function $lf(n: number) {
  return (
    "$lf|pipeline/stages/returnAllFunctionVariables.inject.stage.ts:" + n + " >"
  );
  // Automatically injected by Log Location Injector vscode extension
}
