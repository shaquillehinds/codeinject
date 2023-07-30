import { Collection, ImportDeclaration, JSCodeshift } from "jscodeshift";
import { DebugLogger } from "@utils/Logger";
import { StageOptions } from "@src/@types/stage";
import injectToProgram from "@src/utils/injectToProgram.inject";

const log = DebugLogger("import.inject.stage.ts");

export default function injectImportStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { importName, source, isDefault, col }: StageOptions<"import">
): Collection {
  if (!col) {
    log("error", "No expression collection passed to this stage.");
    return workingSource;
  }
  const newImport = jcs.importDeclaration(
    [
      isDefault
        ? jcs.importDefaultSpecifier(jcs.identifier(importName))
        : jcs.importSpecifier(jcs.identifier(importName))
    ],
    jcs.stringLiteral(source)
  );

  let size = col.size();

  if (size)
    col.insertBefore((e: ImportDeclaration, i: number) =>
      i === size - 1 ? newImport : undefined
    );
  else
    injectToProgram(workingSource, [
      { statement: newImport, injectionLine: "first" }
    ]);

  return workingSource;
}
