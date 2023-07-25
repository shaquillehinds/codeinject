import { Collection, JSCodeshift, SwitchStatement } from "jscodeshift";

export default function injectSwitchCaseStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { caseName, statements, col, identifier }: StageOptions<"case">
) {
  if (!col) {
    console.error("No expression collection passed to injectSwitchCaseStage");
    return workingSource;
  }
  const newCase = jcs.switchCase(
    identifier ? jcs.identifier(caseName) : jcs.literal(caseName),
    statements
  );

  const switchStatement = col.get().value as SwitchStatement;

  switchStatement.cases.unshift(newCase);

  col.forEach((p) => p.replace(switchStatement));

  return workingSource;
}
