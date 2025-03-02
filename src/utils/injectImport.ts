import existingImportFinder from "@src/pipeline/finders/existingImport.finder";
import jcs, { Collection, ImportDeclaration } from "jscodeshift";
import injectToProgram from "./injectToProgram.inject";
type InjectImportProps = {
  source?: string;
  importName?: string;
  workingSource: Collection;
  isDefault?: boolean;
  raw?: boolean;
  col: Collection<ImportDeclaration>;
};

export default function injectImport({
  source,
  importName,
  workingSource,
  isDefault,
  col,
  raw
}: InjectImportProps) {
  if (!source || !importName) {
    console.error(
      "source and importName props required if nodes aren't provided"
    );
    return workingSource;
  }
  const existingImport = existingImportFinder(jcs, workingSource, { source });
  if (existingImport.size() && !raw) {
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
