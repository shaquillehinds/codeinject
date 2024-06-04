import { Collection, JSCodeshift } from "jscodeshift";
import { DebugLogger } from "@utils/Logger";
import { StageOptionsAndIdName } from "@src/@types/stage";
import addBrackets from "@src/utils/addBrackets";

const log = DebugLogger("classMember.inject.stage.ts");

export default function injectClassMemberStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { col, stringTemplate }: StageOptionsAndIdName<"classMember">
) {
  if (!col) {
    log("error", "No expression collection passed to this stage.");
    return workingSource;
  }

  const originalNodes = col.get().value.body;

  const ast2 = jcs.withParser("tsx")(
    `class Template ${addBrackets(stringTemplate)}
  `
  );

  const col2 = ast2.find(jcs.ClassBody);
  const templateNodes = col2.get().value.body;

  const newNodes = [...originalNodes, ...templateNodes];

  const newClassBody = jcs.classBody(newNodes);

  col.replaceWith(newClassBody);

  return workingSource;
}
