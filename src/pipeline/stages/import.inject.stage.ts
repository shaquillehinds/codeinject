import { Collection, ImportDeclaration, JSCodeshift } from "jscodeshift";

export default function injectImportStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { importName, source, isDefault, col }: StageOptions<"import">
): Collection {
  if (!col) {
    console.error("No expression collection passed to injectImportStage");
    return workingSource;
  }
  const newImport = jcs.importDeclaration(
    [
      isDefault
        ? jcs.importDefaultSpecifier(jcs.identifier(importName))
        : jcs.importSpecifier(jcs.identifier(importName)),
    ],
    jcs.stringLiteral(source)
  );

  let size = col.size();

  col.insertBefore((e: ImportDeclaration, i: number) =>
    i === size - 1 ? newImport : undefined
  );

  return workingSource;
}
