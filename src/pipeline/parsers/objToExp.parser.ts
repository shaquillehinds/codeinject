import { JSCodeshift, ObjectMethod, ObjectProperty } from "jscodeshift";
import { ExpressionKind, PatternKind } from "ast-types/gen/kinds";
import arrToExp from "./arrToExp.parser";
import funcToExp from "./funcToExp.parser";
import stringToASTType from "./stringToASTType.parser";

interface Obj {
  [key: string]: any;
}

export default function objToExp(jcs: JSCodeshift, obj: Obj) {
  const properties: (ObjectProperty | ObjectMethod)[] = [];
  for (const key in obj) {
    const property = obj[key];
    let value: ExpressionKind | PatternKind;
    switch (typeof property) {
      case "object": {
        if (property instanceof Array) {
          value = arrToExp(jcs, property);
        } else {
          value = objToExp(jcs, property);
        }
        break;
      }
      case "function": {
        const res = funcToExp(jcs, property);
        if (
          res.type === "ArrowFunctionExpression" ||
          res.type === "FunctionExpression"
        )
          value = res;
        else {
          properties.push(res);
          continue;
        }
        break;
      }
      case "string": {
        const { type, string } = stringToASTType(property);
        if (type.type === "Identifier" && string === key) {
          properties.push(
            jcs.objectProperty.from({ shorthand: true, key: type, value: type })
          );
          continue;
        }
        value = type;
        break;
      }
      default:
        value = jcs.literal(property);
    }

    properties.push(jcs.objectProperty(jcs.identifier(key), value));
  }
  return jcs.objectExpression(properties);
}
