import { Collection, JSCodeshift, TSModuleDeclaration } from "jscodeshift";
import { DebugLogger } from "@utils/Logger";
import { StageOptionsAndIdName } from "@src/@types/stage";
import injectStringTemplateStage from "./stringTemplate.inject.stage";
import programFinder from "../finders/program.finder";
import addBrackets from "@src/utils/addBrackets";

const log = DebugLogger("namespace.inject.stage.ts");

export default function injectTSNamespaceStage(
  jcs: JSCodeshift,
  workingSource: Collection,
  {
    col,
    stringTemplate,
    idName,
    forceInject
  }: StageOptionsAndIdName<"tsNamespace">
) {
  if (!col) {
    log("error", "No expression collection passed to this stage.");
    return workingSource;
  }

  if (!col.size()) {
    if (forceInject) {
      let template = "";
      if (stringTemplate.includes("namespace")) template = stringTemplate;
      else {
        template = `namespace ${idName} ${addBrackets(stringTemplate)}`;
      }
      return injectStringTemplateStage(jcs, workingSource, {
        template,
        position: "afterImport",
        forceInject: true,
        col: programFinder(jcs, workingSource)
      });
    } else
      throw new Error(
        `No namespace by the name ${idName}. Set forceInject to true if you want to add ${idName} despite this.`
      );
  }

  const originalDeclaration = col.get().value as TSModuleDeclaration;
  const originalNodes =
    originalDeclaration.body?.body instanceof Array
      ? originalDeclaration.body.body
      : originalDeclaration.body?.body?.type === "TSModuleBlock"
      ? originalDeclaration.body.body.body
      : originalDeclaration.body?.body?.type === "TSModuleDeclaration"
      ? originalDeclaration.body.body.body?.type === "TSModuleBlock"
        ? originalDeclaration.body.body.body.body
        : []
      : [];

  const ast2 = jcs.withParser("tsx")(
    `namespace Template ${addBrackets(stringTemplate)}
  `
  );

  const col2 = ast2.find(jcs.TSModuleDeclaration);
  const templateDeclaration = col2.get().value as TSModuleDeclaration;
  const templateNodes =
    templateDeclaration.body?.body instanceof Array
      ? templateDeclaration.body.body
      : templateDeclaration.body?.body?.type === "TSModuleBlock"
      ? templateDeclaration.body.body.body
      : templateDeclaration.body?.body?.type === "TSModuleDeclaration"
      ? templateDeclaration.body.body.body?.type === "TSModuleBlock"
        ? templateDeclaration.body.body.body.body
        : []
      : [];

  const newNodes = [...originalNodes, ...templateNodes];

  const newNamespaceBody = jcs.tsModuleBlock(newNodes);

  originalDeclaration.body = newNamespaceBody;

  col.replaceWith(originalDeclaration);

  return workingSource;
}
