import { JSCodeshift, ObjectMethod, ObjectProperty } from "jscodeshift";
import { ExpressionKind, PatternKind } from "ast-types/gen/kinds";
import arrToExp from "./arrToExp.parser";
import funcToExp from "./funcToExp.parser";

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
        const split = property.split("@jcs.identifier");
        if (split[1] !== undefined) {
          if (split[0] === key) {
            const id = jcs.identifier(key);
            properties.push(
              jcs.objectProperty.from({ shorthand: true, key: id, value: id })
            );
            continue;
          }
          value = jcs.identifier(split[0]);
        } else value = jcs.literal(split[0]);
        break;
      }
      default:
        value = jcs.literal(property);
    }

    properties.push(jcs.objectProperty(jcs.identifier(key), value));
  }
  return jcs.objectExpression(properties);
}
