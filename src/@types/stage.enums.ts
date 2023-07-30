export enum StageTypeE {
  property = "property",
  arrayElement = "arrayElement",
  case = "case",
  import = "import",
  tsEnumMember = "tsEnumMember",
  tsInterfaceBody = "tsInterfaceBody",
  tsTypeAlias = "tsTypeAlias",
  tsTypeAliasConditional = "tsTypeAliasConditional",
  tsTypeLiteral = "tsTypeLiteral",
  stringTemplate = "stringTemplate",
  namedExportProperty = "namedExportProperty",
  classMember = "classMember"
}
export enum StageNameE {
  import = "injectImportStage",
  property = "injectPropertyStage",
  case = "injectSwitchCaseStage",
  namedExportProperty = "injectNamedExportPropertyStage",
  tsTypeAlias = "injectTSTypeAliasStage",
  arrayElement = "injectArrayElementStage",
  tsEnumMember = "injectTSEnumMemberStage",
  tsTypeLiteral = "injectTSTypeLiteralStage",
  stringTemplate = "injectStringTemplateStage",
  tsInterfaceBody = "injectTSInterfaceBodyStage",
  tsTypeAliasConditional = "injectTSTypeAliasConditionalStage",
  classMember = "injectClassMemberStage"
}
