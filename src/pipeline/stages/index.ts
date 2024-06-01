import injectImportStage from "./import.inject.stage";
import injectPropertyStage from "./property.inject.stage";
import injectSwitchCaseStage from "./switchCase.inject.stage";
import injectJSXElementStage from "./jsxElement.inject.stage";
import injectTSTypeAliasStage from "./tsTypeAlias.inject.stage";
import injectArrayElementStage from "./arrayElement.inject.stage";
import injectTSEnumMemberStage from "./tsEnumMember.inject.stage";
import injectTSTypeLiteralStage from "./tsTypeLiteral.inject.stage";
import injectStringTemplateStage from "./stringTemplate.inject.stage";
import injectTSInterfaceBodyStage from "./tsInterfaceBody.inject.stage";
import injectClassMemberStage from "./classMember.inject.stage";
import injectClassConstructorStage from "./classConstructor.inject.stage";
import injectNamedExportPropertyStage from "./namedExportProperty.inject.stage";
import injectTSTypeAliasConditionalStage from "./tsTypeAliasConditional.inject.stage";

const stages = {
  injectImportStage,
  injectPropertyStage,
  injectSwitchCaseStage,
  injectJSXElementStage,
  injectTSTypeAliasStage,
  injectClassMemberStage,
  injectArrayElementStage,
  injectTSEnumMemberStage,
  injectTSTypeLiteralStage,
  injectStringTemplateStage,
  injectTSInterfaceBodyStage,
  injectClassConstructorStage,
  injectNamedExportPropertyStage,
  injectTSTypeAliasConditionalStage
};

export default stages;
