import { Collection, ImportDeclaration, JSCodeshift } from "jscodeshift";
import { DebugLogger } from "@utils/Logger";
import { StageOptions } from "@src/@types/stage";
import injectToProgram from "@src/utils/injectToProgram.inject";
import existingImportFinder from "../finders/existingImport.finder";

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

  const existingImport = existingImportFinder(jcs, workingSource, { source });
  if (existingImport.size()) {
    const newImportSpecifier = isDefault
      ? jcs.importDefaultSpecifier({
          name: importName,
          type: "Identifier"
        })
      : jcs.importSpecifier({
          name: importName,
          type: "Identifier"
        });
    existingImport.forEach(path => {
      isDefault
        ? path.value.specifiers!.unshift(newImportSpecifier)
        : path.value.specifiers!.push(newImportSpecifier);
    });
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
