import { Collection, JSCodeshift, TSEnumDeclaration } from "jscodeshift";
import { DebugLogger } from "@utils/Logger";
import { StageOptionsAndIdName } from "@src/@types/stage";
import injectToProgram from "@src/utils/injectToProgram.inject";

const log = DebugLogger("tsEnumMember.inject.stage.ts");

export default function injectTSEnumMemberStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  {
    key,
    value,
    col,
    forceInject,
    idName
  }: StageOptionsAndIdName<"tsEnumMember">
) {
  if (!col) {
    log("error", "No expression collection passed to this stage.");
    return workingSource;
  }
  const colSize = col.size();

  if (colSize === 0 && !forceInject)
    log("error", `Type alias ${idName} was not found.`);

  const newMember = jcs.tsEnumMember(jcs.identifier(key), jcs.literal(value));

  if (colSize !== 0) {
    const tsEnumMember = col.get().value as TSEnumDeclaration;
    tsEnumMember.members.push(newMember);
    col.forEach(p => p.replace(tsEnumMember));
  } else {
    injectToProgram(workingSource, [
      {
        statement: jcs.exportNamedDeclaration(
          jcs.tsEnumDeclaration(jcs.identifier(idName), [newMember])
        )
      }
    ]);
  }

  return workingSource;
}
