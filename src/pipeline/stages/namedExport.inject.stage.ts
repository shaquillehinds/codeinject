import { Collection, JSCodeshift } from "jscodeshift";

export default function injectNamedExportStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { name, col }: StageOptions<"namedExport">
): Collection {
  if (!col) {
    console.error("No expression collection passed to injectImportStage");
    return workingSource;
  }
  const namedExpSpecifiers = col.find(jcs.ExportSpecifier);
  const expId = jcs.identifier(name);
  const newExport = jcs.exportSpecifier.from({ local: expId, exported: expId });

  const newExportDec = jcs.exportNamedDeclaration(null, [
    ...namedExpSpecifiers.nodes(),
    newExport,
  ]);

  const exportDec = namedExpSpecifiers.closest(jcs.ExportNamedDeclaration);

  exportDec.replaceWith(newExportDec);

  return workingSource;
}
