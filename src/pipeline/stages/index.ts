import injectImportStage from "./import.inject.stage";
import injectPropertyStage from "./property.inject.stage";
import injectSwitchCaseStage from "./switchCase.inject.stage";
import injectTSTypeAliasStage from "./tsTypeAlias.inject.stage";
import injectArrayElementStage from "./arrayElement.inject.stage";
import injectTSEnumMemberStage from "./tsEnumMember.inject.stage";
import injectTSTypeLiteralStage from "./tsTypeLiteral.inject.stage";
import injectStringTemplateStage from "./stringTemplate.inject.stage";
import injectTSInterfaceBodyStage from "./tsInterfaceBody.inject.stage";
import injectClassMemberStage from "./classMember.inject.stage";
import injectNamedExportPropertyStage from "./namedExportProperty.inject.stage";
import injectTSTypeAliasConditionalStage from "./tsTypeAliasConditional.inject.stage";

const stages = {
  injectClassMemberStage,
  injectImportStage,
  injectPropertyStage,
  injectSwitchCaseStage,
  injectTSTypeAliasStage,
  injectArrayElementStage,
  injectTSEnumMemberStage,
  injectTSTypeLiteralStage,
  injectStringTemplateStage,
  injectTSInterfaceBodyStage,
  injectNamedExportPropertyStage,
  injectTSTypeAliasConditionalStage
};

export default stages;
