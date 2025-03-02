import { Collection, JSCodeshift } from "jscodeshift";
import { StageOptions } from "@src/@types/stage";
import addBrackets from "@src/utils/addBrackets";

export default function injectReturnStatementStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { col, stringTemplate, node }: StageOptions<"returnStatement">
) {
  if (!col) {
    console.warn($lf(11), "No expression collection passed to this stage.");
    return workingSource;
  }
  if (!node && !stringTemplate) {
    console.warn(
      "Either pass a node or stringTemplate to injectReturnStatement"
    );
    return workingSource;
  }

  if (stringTemplate) {
    const template = `return ${stringTemplate}`;
    const ast = jcs.withParser("tsx")(template);
    const newNode = ast.find(jcs.ReturnStatement).paths()[0].node;
    //@ts-ignore
    col.map(p => {
      if (p.value.body.type === "BlockStatement") {
        p.value.body.body.push(newNode);
      }
      return p;
    });
  }
  if (node) {
    //@ts-ignore
    col.map(p => {
      if (p.value.body.type === "BlockStatement") {
        p.value.body.body.push(node);
      }
      return p;
    });
  }

  return workingSource;
}

function $lf(n: number) {
  return "$lf|pipeline/stages/returnStatement.inject.stage.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
