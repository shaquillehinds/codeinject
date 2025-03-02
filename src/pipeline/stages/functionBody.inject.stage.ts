import { Collection, JSCodeshift } from "jscodeshift";
import { DebugLogger } from "@utils/Logger";
import { StageOptions } from "@src/@types/stage";
import addBrackets from "@src/utils/addBrackets";

const log = DebugLogger("functionBody.inject.stage.ts");

export default function injectFunctionBodyStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { col, nodes, stringTemplate }: StageOptions<"functionBody">
) {
  if (!col) {
    log($lf(14), "error", "No expression collection passed to this stage.");
    return workingSource;
  }
  const blockCol = col.find(jcs.BlockStatement);
  const originalNodes = blockCol.get().value.body;
  if (nodes) {
    const newCol = jcs.blockStatement([...originalNodes, ...nodes]);
    blockCol.replaceWith(newCol);
  } else if (stringTemplate) {
    const ast2 = jcs.withParser("tsx")(
      `function Template ()${addBrackets(stringTemplate)}
    `
    );
    const col2 = ast2.find(jcs.BlockStatement);
    const templateNodes = col2.get().value.body;
    const newNodes = jcs.blockStatement([...originalNodes, ...templateNodes]);
    blockCol.replaceWith(newNodes);
  }
  return workingSource;
}

function $lf(n: number) {
  return "$lf|pipeline/stages/functionBody.inject.stage.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
