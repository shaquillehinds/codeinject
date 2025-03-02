import injectImportStage from "./import.inject.stage";
import injectPropertyStage from "./property.inject.stage";
import injectSwitchCaseStage from "./switchCase.inject.stage";
import injectJSXElementStage from "./jsxElement.inject.stage";
import injectTSNamespaceStage from "./tsNamespace.inject.stage";
import injectClassMemberStage from "./classMember.inject.stage";
import injectTSTypeAliasStage from "./tsTypeAlias.inject.stage";
import injectArrayElementStage from "./arrayElement.inject.stage";
import injectTSEnumMemberStage from "./tsEnumMember.inject.stage";
import injectTSTypeLiteralStage from "./tsTypeLiteral.inject.stage";
import injectStringTemplateStage from "./stringTemplate.inject.stage";
import injectTSInterfaceBodyStage from "./tsInterfaceBody.inject.stage";
import injectClassConstructorStage from "./classConstructor.inject.stage";
import injectNamedExportPropertyStage from "./namedExportProperty.inject.stage";
import injectFunctionBodyStage from "./functionBody.inject.stage";
import injectReturnObjectPropertyStage from "./returnObjectProperty.inject.stage";
import injectImportsFromFileStage from "./importsFromFile.inject.stage";
import injectReturnAllFunctionVariablesStage from "./returnAllFunctionVariables.inject.stage";
import injectFunctionParamsStage from "./functionParams.inject.stage";
import injectObjectForAccessorsStage from "./objectForAccessors.inject.stage";
import injectToProgramStage from "./program.inject.stage";
import injectTSTypeAliasConditionalStage from "./tsTypeAliasConditional.inject.stage";

const stages = {
  injectToProgramStage,
  injectObjectForAccessorsStage,
  injectFunctionParamsStage,
  injectReturnAllFunctionVariablesStage,
  injectImportsFromFileStage,
  injectReturnObjectPropertyStage,
  injectFunctionBodyStage,
  injectImportStage,
  injectPropertyStage,
  injectSwitchCaseStage,
  injectJSXElementStage,
  injectTSTypeAliasStage,
  injectClassMemberStage,
  injectTSNamespaceStage,
  injectArrayElementStage,
  injectTSEnumMemberStage,
  injectTSTypeLiteralStage,
  injectStringTemplateStage,
  injectTSInterfaceBodyStage,
  injectClassConstructorStage,
  injectNamedExportPropertyStage,
  injectTSTypeAliasConditionalStage
};

export type Stages = typeof stages;
export type StagesKey = keyof Stages;
export type StagesOpts<K extends StagesKey> = Parameters<Stages[K]>[2];

export default stages;
