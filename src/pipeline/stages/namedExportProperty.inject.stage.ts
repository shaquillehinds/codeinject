import { Collection, JSCodeshift } from "jscodeshift";
import { DebugLogger } from "@utils/Logger";
import { StageOptionsAndIdName } from "@src/@types/stage";
import injectToProgram from "@src/utils/injectToProgram.inject";

const log = DebugLogger("namedExport.inject.stage.ts");

export default function injectNamedExportPropertyStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { name, col }: StageOptionsAndIdName<"namedExportProperty">
): Collection {
  if (!col) {
    log("error", "No expression collection passed to this stage.");
    return workingSource;
  }

  const expId = jcs.identifier(name);

  const colSize = col.size();

  if (colSize === 0) {
    injectToProgram(workingSource, [
      {
        statement: jcs.exportNamedDeclaration(null, [
          jcs.exportSpecifier.from({ local: expId, exported: expId })
        ])
      }
    ]);

    return workingSource;
  }

  const namedExpSpecifiers = col.find(jcs.ExportSpecifier);
  const newExport = jcs.exportSpecifier.from({ local: expId, exported: expId });

  const newExportDec = jcs.exportNamedDeclaration(null, [
    ...namedExpSpecifiers.nodes(),
    newExport
  ]);

  const exportDec = namedExpSpecifiers.closest(jcs.ExportNamedDeclaration);

  exportDec.replaceWith(newExportDec);

  return workingSource;
}
