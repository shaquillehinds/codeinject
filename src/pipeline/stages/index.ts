import injectImportStage from "./import.inject.stage";
import injectPropertyStage from "./property.inject.stage";
import injectSwitchCaseStage from "./switchCase.inject.stage";
import injectTSTypeAliasStage from "./tsTypeAlias.inject.stage";
import injectNamedExportStage from "./namedExport.inject.stage";
import injectArrayElementStage from "./arrayElement.inject.stage";
import injectTSEnumMemberStage from "./tsEnumMember.inject.stage";
import injectTSTypeLiteralStage from "./tsTypeLiteral.inject.stage";
import injectStringTemplateStage from "./stringTemplate.inject.stage";
import injectTSInterfaceBodyStage from "./tsInterfaceBody.inject.stage";
import injectTSTypeAliasConditionalStage from "./tsTypeAliasConditional.inject.stage";

const stages = {
  injectImportStage,
  injectPropertyStage,
  injectSwitchCaseStage,
  injectNamedExportStage,
  injectTSTypeAliasStage,
  injectArrayElementStage,
  injectTSEnumMemberStage,
  injectTSTypeLiteralStage,
  injectStringTemplateStage,
  injectTSInterfaceBodyStage,
  injectTSTypeAliasConditionalStage,
};

export default stages;
