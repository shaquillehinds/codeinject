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
  addObjectForAccessors({ accessors, objectName, collection: workingSource });

  return workingSource;
}
