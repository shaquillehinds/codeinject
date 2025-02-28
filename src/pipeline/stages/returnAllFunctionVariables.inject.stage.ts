import { Collection, JSCodeshift } from "jscodeshift";
import { DebugLogger } from "@utils/Logger";
import { StageOptions } from "@src/@types/stage";
import injectReturnObjectPropertyStage from "./returnObjectProperty.inject.stage";
import getDefinedVariableName from "@src/utils/getDefinedVariableName";

const log = DebugLogger("returnAllFunctionVariables.inject.stage.ts");

export default function injectReturnAllFunctionVariablesStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { col }: StageOptions<"returnAllFunctionVariables">
) {
  if (!col) {
    console.log($lf(15), "No expression collection passed to this stage.");
    return workingSource;
  }
  let stringTemplate = "";
  col
    .find(jcs.BlockStatement)
    .at(0)
    .nodes()[0]
    .body.forEach(statement => {
      const name = getDefinedVariableName(statement);
      if (name.length)
        stringTemplate += "," + (name.length > 1 ? name.join(",") : name[0]);
    });

  stringTemplate = stringTemplate.slice(1);
  injectReturnObjectPropertyStage(jcs, workingSource, { stringTemplate, col });

  return workingSource;
}

function $lf(n: number) {
  return (
    "$lf|pipeline/stages/returnAllFunctionVariables.inject.stage.ts:" + n + " >"
  );
  // Automatically injected by Log Location Injector vscode extension
}
