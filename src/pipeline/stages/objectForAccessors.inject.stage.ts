import { Collection, JSCodeshift } from "jscodeshift";
import { StageOptions } from "@src/@types/stage";
import addObjectForAccessors from "@src/utils/addObjectForAccessors";

export default function injectObjectForAccessorsStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { col, accessors, objectName }: StageOptions<"objectForAccessors">
) {
  addObjectForAccessors({ accessors, objectName, collection: workingSource });

  return workingSource;
}
