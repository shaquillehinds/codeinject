import { Collection, ImportDeclaration, JSCodeshift } from "jscodeshift";

export default function injectImportStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { importName, source, isDefault }: StageOptions<"import">
): Collection {
  const newImport = jcs.importDeclaration(
    [
      isDefault
        ? jcs.importDefaultSpecifier(jcs.identifier(importName))
        : jcs.importSpecifier(jcs.identifier(importName)),
    ],
    jcs.stringLiteral(source)
  );

  const importCollection = workingSource.find(jcs.ImportDeclaration);
  let size = importCollection.size();

  importCollection.insertBefore((e: ImportDeclaration, i: number) =>
    i === size - 1 ? newImport : undefined
  );

  return workingSource;
}
