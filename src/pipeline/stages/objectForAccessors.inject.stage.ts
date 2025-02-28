import { Collection, JSCodeshift } from "jscodeshift";
import { StageOptions } from "@src/@types/stage";
import addObjectForAccessors from "@src/utils/addObjectForAccessors";

export default function injectObjectForAccessorsStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { accessors: a, objectName, ip }: StageOptions<"objectForAccessors">
) {
  let accessors: string[] = [];
  if (Array.isArray(a)) accessors = a;
  else if (ip) accessors = a(ip);
  console.log($lf(13), accessors);
  addObjectForAccessors({ accessors, objectName, collection: workingSource });

  return workingSource;
}

function $lf(n: number) {
  return "$lf|pipeline/stages/objectForAccessors.inject.stage.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
