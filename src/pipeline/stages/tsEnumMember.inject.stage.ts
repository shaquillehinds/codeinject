import { Collection, JSCodeshift, TSEnumDeclaration } from "jscodeshift";
import { DebugLogger } from "@utils/Logger";

const log = DebugLogger("tsEnumMember.inject.stage.ts");

export default function injectTSEnumMemberStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { key, value, col }: StageOptions<"tsEnumMember">
) {
  if (!col) {
    log("error", "No expression collection passed to this stage.");
    return workingSource;
  }
  const newMember = jcs.tsEnumMember(jcs.identifier(key), jcs.literal(value));
  const tsEnumMember = col.get().value as TSEnumDeclaration;
  tsEnumMember.members.push(newMember);
  col.forEach((p) => p.replace(tsEnumMember));

  return workingSource;
}
