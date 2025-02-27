import { Collection, ImportDeclaration, JSCodeshift } from "jscodeshift";
import { DebugLogger } from "@utils/Logger";
import { StageOptions } from "@src/@types/stage";
import { readFileSync } from "fs";
import injectImportStage from "./import.inject.stage";

const log = DebugLogger("importsFromFile.inject.stage.ts");

export default function injectImportsFromFileStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { col, origin, all }: StageOptions<"importsFromFile">
) {
  if (!col) {
    log($lf(15), "error", "No expression collection passed to this stage.");
    return workingSource;
  }
  let fileContent = "";
  if (origin.type === "source") {
    fileContent = readFileSync(origin.source, "utf-8");
  } else {
    fileContent = origin.text;
  }
  const ast = jcs.withParser("tsx")(fileContent);

  const importNames: string[] = [];
  const imports: Record<string, { source: string; node: ImportDeclaration }> =
    {};
  const importedSources: string[] = [];
  const declarations = ast.find(jcs.ImportDeclaration);

  declarations.forEach(path => {
    const specifiers = path.getValueProperty("specifiers");
    const source = path.getValueProperty("source").value as string;
    if (Array.isArray(specifiers))
      specifiers.forEach(s => {
        const importName = s.local?.name || s.imported?.name || "";
        importNames.push(importName);
        imports[importName] = { source, node: path.node };
      });
  });

  const content = workingSource.toSource();
  for (const imp in imports) {
    if (
      (content.includes(imp) || all) &&
      !importedSources.includes(imports[imp].source)
    ) {
      injectImportStage(jcs, workingSource, {
        nodes: [imports[imp].node],
        col
      });
      importedSources.push(imports[imp].source);
    }
  }

  return workingSource;
}

function $lf(n: number) {
  return "$lf|pipeline/stages/importsFromFile.inject.stage.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
