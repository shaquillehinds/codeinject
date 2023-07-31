import { Collection, JSCodeshift, SwitchStatement } from "jscodeshift";
import { DebugLogger } from "@utils/Logger";
import { StageOptionsAndIdName } from "@src/@types/stage";

const log = DebugLogger("switchCase.inject.stage.ts");

export default function injectSwitchCaseStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { caseName, statements, col, identifier }: StageOptionsAndIdName<"case">
) {
  if (!col) {
    log("error", "No expression collection passed to this stage.");
    return workingSource;
  }
  const newCase = jcs.switchCase(
    identifier ? jcs.identifier(caseName) : jcs.literal(caseName),
    statements
  );

  const switchStatement = col.get().value as SwitchStatement;

  switchStatement.cases.unshift(newCase);

  col.forEach(p => p.replace(switchStatement));

  return workingSource;
}
