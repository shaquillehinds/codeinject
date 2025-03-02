import { Collection, JSCodeshift, Program } from "jscodeshift";
import importFinder from "../finders/import.finder";
import { DebugLogger } from "@utils/Logger";
import { StageOptions } from "@src/@types/stage";

const log = DebugLogger("stringTemplate.inject.stage.ts");
/**
 *
 * @param options.stringTemplate - Provide typescipt code in a template string
 * @example
 * ```
 * (`
 * function hello(){
 *    return "world";
 *  }
 * `)
 * ```
 */
export default function injectStringTemplateStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { template, position, col }: StageOptions<"stringTemplate">
) {
  if (!col) {
    log($lf(25), "error", "No expression collection passed to this stage.");
    return workingSource;
  }
  const templateNodes = jcs.withParser("tsx")(template).find(jcs.Program).get()
    .value.body;
  const astNodes = col.get().value.body;
  let newProgram: Program | undefined;
  switch (position) {
    case "afterImport": {
      const col = importFinder(jcs, workingSource, {});
      const size = col.size();
      if (size < 1) newProgram = jcs.program([...templateNodes, ...astNodes]);
      else {
        col.insertAfter((imp: any, i: number) =>
          i === size - 1 ? templateNodes : undefined
        );
      }
      break;
    }
    case "beforeImport": {
      const col = importFinder(jcs, workingSource, {});
      const size = col.size();
      if (size < 1) newProgram = jcs.program([...templateNodes, ...astNodes]);
      else {
        col.insertBefore((imp: any, i: number) =>
          i === 0 ? templateNodes : undefined
        );
      }
      break;
    }
    case "firstLine":
      newProgram = jcs.program([...templateNodes, ...astNodes]);
      break;
    default:
      newProgram = jcs.program([...astNodes, ...templateNodes]);
      break;
  }
  if (newProgram) col.replaceWith(newProgram);

  return workingSource;
}

function $lf(n: number) {
  return "$lf|pipeline/stages/stringTemplate.inject.stage.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
