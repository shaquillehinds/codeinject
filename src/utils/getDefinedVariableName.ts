import { StatementKind } from "ast-types/gen/kinds";
import jcs from "jscodeshift";

export default function getDefinedVariableName(statement: StatementKind) {
  if (jcs.VariableDeclaration.check(statement)) {
    let names: string[] = [];
    statement.declarations.forEach(declaration => {
      const isDeclarator = declaration.type === "VariableDeclarator";
      const validated = isDeclarator ? declaration.id : declaration;
      if (jcs.ArrayPattern.check(validated)) {
        validated.elements.forEach(el => {
          if (el && jcs.Identifier.check(el)) {
            names.push(el.name);
          }
        });
      } else if (jcs.ObjectPattern.check(validated)) {
        validated.properties.forEach(prop => {
          if (
            prop.type !== "SpreadProperty" &&
            prop.type !== "SpreadPropertyPattern" &&
            prop.type !== "RestProperty" &&
            jcs.Identifier.check(prop.key)
          ) {
            if (
              prop.type !== "PropertyPattern" &&
              jcs.Identifier.check(prop.value)
            )
              names.push(prop.value.name);
            else names.push(prop.key.name);
          }
        });
      } else if (jcs.Identifier.check(validated)) {
        names.push(validated.name);
      }
    });
    return names;
  } else if (jcs.FunctionDeclaration.check(statement)) {
    return [statement.id?.name || ""];
  }
  return [];
}

function $lf(n: number) {
  return "$lf|src/utils/getDefinedVariableName.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
