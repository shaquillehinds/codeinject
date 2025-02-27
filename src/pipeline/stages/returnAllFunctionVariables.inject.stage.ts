import { Collection, JSCodeshift } from "jscodeshift";
import { DebugLogger } from "@utils/Logger";
import { StageOptions } from "@src/@types/stage";
import InjectionPipeline from "../Injection.pipeline";
import injectReturnObjectPropertyStage from "./returnObjectProperty.inject.stage";

const log = DebugLogger("returnAllFunctionVariables.inject.stage.ts");

export default function injectReturnAllFunctionVariablesStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { col }: StageOptions<"returnAllFunctionVariables">
) {
  if (!col) {
    console.log($lf(15), "No expression collection passed to this stage.");
    return workingSource;
  }
  let stringTemplate = "";
  // const functionCol = InjectionPipeline.getFinder("functionFinder")(jcs, col, {
  //   name: "BlankTemplate"
  // }).col;
  col
    .find(jcs.BlockStatement)
    .at(0)
    .nodes()[0]
    .body.forEach(statement => {
      if (jcs.VariableDeclaration.check(statement)) {
        statement.declarations.forEach(declaration => {
          const isDeclarator = declaration.type === "VariableDeclarator";
          const validated = isDeclarator ? declaration.id : declaration;
          if (jcs.ArrayPattern.check(validated)) {
            validated.elements.forEach(el => {
              if (el && jcs.Identifier.check(el))
                stringTemplate += "," + el.name;
            });
          } else if (jcs.ObjectPattern.check(validated)) {
            validated.properties.forEach(prop => {
              if (
                prop.type !== "SpreadProperty" &&
                prop.type !== "SpreadPropertyPattern" &&
                prop.type !== "RestProperty" &&
                jcs.Identifier.check(prop.key)
              )
                stringTemplate += "," + prop.key.name;
            });
          } else if (jcs.Identifier.check(validated)) {
            stringTemplate += "," + validated.name;
          }
        });
      }
    });

  stringTemplate = stringTemplate.slice(1);
  console.log($lf(54), stringTemplate, col);
  injectReturnObjectPropertyStage(jcs, workingSource, { stringTemplate, col });

  return workingSource;
}

function $lf(n: number) {
  return (
    "$lf|pipeline/stages/returnAllFunctionVariables.inject.stage.ts:" + n + " >"
  );
  // Automatically injected by Log Location Injector vscode extension
}
