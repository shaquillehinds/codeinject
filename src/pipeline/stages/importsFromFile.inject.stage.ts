import { Collection, JSCodeshift } from "jscodeshift";
import { StageOptions } from "@src/@types/stage";
import { readFileSync } from "fs";
import injectImport from "@src/utils/injectImport";

export default function injectImportsFromFileStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  { col, origin, all }: StageOptions<"importsFromFile">
) {
  if (!col) {
    console.error($lf(12), "No expression collection passed to this stage.");
    return workingSource;
  }
  let fileContent = "";
  if (origin.type === "source") {
    fileContent = readFileSync(origin.source, "utf-8");
  } else {
    fileContent = origin.text;
  }
  const ast = jcs.withParser("tsx")(fileContent);
  const declarations = ast.find(jcs.ImportDeclaration);

  declarations.forEach(path => {
    const specifiers = path.getValueProperty("specifiers");
    const source = path.getValueProperty("source").value as string;
    if (Array.isArray(specifiers)) {
      for (const specifier of specifiers) {
        const isDefault = specifier.type === "ImportDefaultSpecifier";
        const importName = specifier.local?.name;
        console.log($lf(31), importName);
        if (typeof importName !== "string" || typeof source !== "string")
          continue;
        if (
          !all &&
          !workingSource.find(jcs.Identifier, { name: importName }).length
        )
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
  });

  return workingSource;
}

function $lf(n: number) {
  return "$lf|pipeline/stages/importsFromFile.inject.stage.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
