import { JSCodeshift, RestElement, SpreadElement } from "jscodeshift";
import { ExpressionKind } from "ast-types/gen/kinds";
import objToExp from "./objToExp.parser";

export default function arrToExp(jcs: JSCodeshift, arr: any[]) {
  const expressions: (ExpressionKind | SpreadElement | RestElement)[] = [];
  for (const item of arr) {
    switch (typeof item) {
      case "object": {
        if (item instanceof Array) {
          expressions.push(arrToExp(jcs, item));
        } else {
          expressions.push(objToExp(jcs, item));
        }
        break;
      }
      case "function": {
        const ast = jcs.withParser("tsx")(item.toString());
        const funcDec = ast.find(jcs.FunctionDeclaration).nodes()[0];
        if (funcDec) {
          expressions.push(
            jcs.functionExpression(funcDec.id, funcDec.params, funcDec.body)
          );
        } else
          expressions.push(ast.find(jcs.ArrowFunctionExpression).nodes()[0]);
        break;
      }
      default:
        expressions.push(jcs.literal(item));
    }
  }
  return jcs.arrayExpression(expressions);
}
