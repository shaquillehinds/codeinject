import { Collection, JSCodeshift, TSEnumDeclaration } from "jscodeshift";

export default function injectTSEnumMemberStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { key, value, col }: StageOptions<"tsEnumMember">
) {
  if (!col) {
    console.error("No expression collection passed to injectTSEnumStage");
    return workingSource;
  }
  const newMember = jcs.tsEnumMember(jcs.identifier(key), jcs.literal(value));
  const tsEnumMember = col.get().value as TSEnumDeclaration;
  tsEnumMember.members.push(newMember);
  col.forEach((p) => p.replace(tsEnumMember));

  return workingSource;
}
