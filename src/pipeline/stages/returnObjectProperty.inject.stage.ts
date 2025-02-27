import { Collection, JSCodeshift, Node } from "jscodeshift";
import { StageOptions } from "@src/@types/stage";
import addBrackets from "@src/utils/addBrackets";
import returnFinder from "../finders/return.finder";
import {
  ObjectMethodKind,
  ObjectPropertyKind,
  PropertyKind,
  SpreadElementKind,
  SpreadPropertyKind
} from "ast-types/gen/kinds";

export default function injectReturnObjectPropertyStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { col, stringTemplate, nodes }: StageOptions<"returnObjectProperty">
) {
  if (!col) {
    console.error($lf(19), "No expression collection passed to this stage.");
    return workingSource;
  }

  //@ts-ignore
  const returnStatementCol = returnFinder(jcs, col, {
    argumentType: "ObjectExpression"
  }).col;

  let returnPropertyNodes: (
    | PropertyKind
    | ObjectMethodKind
    | ObjectPropertyKind
    | SpreadPropertyKind
    | SpreadElementKind
  )[] = [];

  if (returnStatementCol.length) {
    returnPropertyNodes =
      returnStatementCol.get().value.argument?.properties || [];
  }

  if (stringTemplate) {
    const template = `return ${addBrackets(stringTemplate)}`;
    const ast = jcs.withParser("tsx")(template);
    const newNodes = ast.find(jcs.ObjectExpression).get().value.properties;
    returnPropertyNodes = [...returnPropertyNodes, ...newNodes];
  }
  if (nodes) {
    returnPropertyNodes = [...returnPropertyNodes, ...nodes];
  }

  const objExp = jcs.objectExpression(returnPropertyNodes);
  const returnStatement = jcs.returnStatement(objExp);

  if (returnStatementCol.length) {
    returnStatementCol.replaceWith([returnStatement]);
  } else {
    const returnStatementCol = col.find(jcs.ReturnStatement);
    if (returnStatementCol.length)
      returnStatementCol.replaceWith([
        ...returnStatementCol.nodes(),
        returnStatement
      ]);
    else {
      let prevBody = col.get().value.body.body;
      prevBody = prevBody?.length ? prevBody : [];
      const newBody = jcs.blockStatement([...prevBody, returnStatement]);
      col.find(jcs.BlockStatement).at(0).replaceWith(newBody);
      // prevBody.repla
    }
  }

  return workingSource;
}

function $lf(n: number) {
  return "$lf|pipeline/stages/returnObjectProperty.inject.stage.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
