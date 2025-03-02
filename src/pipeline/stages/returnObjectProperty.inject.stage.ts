import {
  BlockStatement,
  Collection,
  JSCodeshift,
  Node,
  ReturnStatement
} from "jscodeshift";
import { StageOptions } from "@src/@types/stage";
import addBrackets from "@src/utils/addBrackets";
import returnFinder from "../finders/return.finder";
import {
  ObjectMethodKind,
  ObjectPropertyKind,
  PropertyKind,
  SpreadElementKind,
  SpreadPropertyKind,
  StatementKind
} from "ast-types/gen/kinds";

export default function injectReturnObjectPropertyStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { col, stringTemplate, nodes }: StageOptions<"returnObjectProperty">
) {
  if (!col) {
    console.error($lf(26), "No expression collection passed to this stage.");
    return workingSource;
  }

  //@ts-ignore
  // const returnStatementCol = returnFinder(jcs, col, {
  //   argumentType: "ObjectExpression"
  // }).col;

  let returnStatement: ReturnStatement = undefined;

  const functionBlock = col.find(jcs.BlockStatement).at(0);
  functionBlock.forEach(p => {
    returnStatement = p.value.body.filter(
      s => s.type === "ReturnStatement"
    )[0] as ReturnStatement;
  });

  let returnPropertyNodes: (
    | PropertyKind
    | ObjectMethodKind
    | ObjectPropertyKind
    | SpreadPropertyKind
    | SpreadElementKind
  )[] = [];

  // if (returnStatementCol.length) {
  //   returnPropertyNodes =
  //     returnStatementCol.get().value.argument?.properties || [];
  // }

  if (
    returnStatement &&
    returnStatement.argument?.type === "ObjectExpression"
  ) {
    returnPropertyNodes = returnStatement.argument.properties || [];
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
  const newReturnStatement = jcs.returnStatement(objExp);

  if (
    returnStatement &&
    returnStatement.argument?.type === "ObjectExpression"
  ) {
    functionBlock.map(p => {
      p.value.body = p.value.body.map(s => {
        return s.type === "ReturnStatement" ? newReturnStatement : s;
      });
      return p;
    });
  } else {
    if (returnStatement)
      functionBlock.map(p => {
        p.value.body.push(newReturnStatement);
        return p;
      });
    else {
      let prevBody = col.get().value.body.body;
      prevBody = prevBody?.length ? prevBody : [];
      const newBody = jcs.blockStatement([...prevBody, newReturnStatement]);
      col.find(jcs.BlockStatement).at(0).replaceWith(newBody);
    }
  }

  return workingSource;
}

function $lf(n: number) {
  return "$lf|pipeline/stages/returnObjectProperty.inject.stage.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
