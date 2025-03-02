import { Collection, JSCodeshift } from "jscodeshift";
import { StageOptions } from "@src/@types/stage";
import { injectToProgramV2 } from "@src/utils/injectToProgram.inject";

export default function injectToProgramStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { col, injectionPosition, nodes, stringTemplate }: StageOptions<"program">
) {
  if (!col) {
    console.warn($lf(11), "No expression collection passed to this stage.");
    return workingSource;
  }
  return injectToProgramV2({
    col,
    nodes,
    workingSource,
    stringTemplate,
    position: injectionPosition
  });
}

function $lf(n: number) {
  return "$lf|pipeline/stages/program.inject.stage.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
