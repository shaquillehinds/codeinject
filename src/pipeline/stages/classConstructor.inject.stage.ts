import {
  BlockStatement,
  ClassBody,
  ClassMethod,
  Collection,
  JSCodeshift
} from "jscodeshift";
import { DebugLogger } from "@utils/Logger";
import { StageOptionsAndIdName } from "@src/@types/stage";
import addBrackets from "@src/utils/addBrackets";

const log = DebugLogger("constructor.inject.stage.ts");

export default function injectConstructorStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { col, stringTemplate }: StageOptionsAndIdName<"classConstructor">
) {
  if (!col) {
    log("error", "No expression collection passed to this stage.");
    return workingSource;
  }

  const classBody = col.get().value as ClassBody;

  const isNewConstructor = stringTemplate.includes("constructor");

  const ast2 = jcs.withParser("tsx")(
    isNewConstructor
      ? `class Template ${addBrackets(stringTemplate)}

`
      : `class Template{
  constructor() ${addBrackets(stringTemplate)}
}
`
  );

  const col2 = ast2.find(jcs.ClassMethod, { kind: "constructor" });
  const constructorNode = col2.get().value as ClassMethod;
  const constructorBlock = constructorNode.body;
  const constructorBody = constructorBlock.body[0];

  let hasConstrutor = false;
  const originalNodes = classBody.body.map(node => {
    if (node.type === "ClassMethod" && node.kind === "constructor") {
      hasConstrutor = true;
      node.body.body = [...node.body.body, constructorBody];
    }
    return node;
  });

  const newNodes = [...originalNodes];
  if (!hasConstrutor) newNodes.unshift(constructorNode);

  const newClassBody = jcs.classBody(newNodes);

  col.replaceWith(newClassBody);

  return workingSource;
}
