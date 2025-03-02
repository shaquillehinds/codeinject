import { Collection, JSCodeshift } from "jscodeshift";
import { DebugLogger } from "@utils/Logger";
import { StageOptions } from "@src/@types/stage";
import injectToProgram from "@src/utils/injectToProgram.inject";
import injectImport from "@src/utils/injectImport";

const log = DebugLogger("import.inject.stage.ts");

export default function injectImportStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { importName, source, isDefault, col, nodes, raw }: StageOptions<"import">
): Collection {
  if (!col) {
    log($lf(15), "error", "No expression collection passed to this stage.");
    return workingSource;
  }
  if (raw && nodes) {
    injectToProgram(
      workingSource,
      nodes.map(statement => ({
        statement,
        injectionLine: "first"
      }))
    );
    return workingSource;
  }

  if (nodes) {
    for (const node of nodes) {
      if (!node.specifiers) continue;
      for (const specifier of node.specifiers) {
        const isDefault = specifier.type === "ImportDefaultSpecifier";
        const importName = specifier.local?.name;
        const source = node.source.value;
        if (typeof importName !== "string" || typeof source !== "string")
          continue;
        if (!raw && !workingSource.find(jcs.Identifier, { name: importName }))
          continue;
        injectImport({
          col,
          source,
          isDefault,
          importName,
          workingSource
        });
      }
    }
    return workingSource;
  } else {
    return injectImport({
      importName,
      source,
      isDefault,
      col,
      workingSource,
      raw
    });
  }
}

function $lf(n: number) {
  return "$lf|pipeline/stages/import.inject.stage.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
