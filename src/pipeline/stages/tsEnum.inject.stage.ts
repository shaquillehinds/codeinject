import { Collection, JSCodeshift, TSEnumDeclaration } from "jscodeshift";

export default function injectTSEnumStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { key, value, col }: StageOptions<"tsEnum">
) {
  if (!col) {
    console.error("No expression collection passed to injectTSEnumStage");
    return workingSource;
  }
  const newMember = jcs.tsEnumMember(jcs.identifier(key), jcs.literal(value));
  const tsEnum = col.get().value as TSEnumDeclaration;
  tsEnum.members.push(newMember);
  col.forEach((p) => p.replace(tsEnum));

  // const prevMembers = col.get().value.members;
  // console.log(prevMembers);
  // const newEnumCol = jcs.tsEnumDeclaration(jcs.identifier("AppActionType"), [
  //   ...prevMembers,
  //   newMember,
  // ]);
  // col.forEach((e) => e.replace(newEnumCol));
  return workingSource;
}
