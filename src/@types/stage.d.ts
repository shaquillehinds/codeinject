enum StageTypeE {
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
  namedExport = "namedExport",
  classMember = "classMember",
}

type StageType = keyof typeof StageTypeE;

type StageOptions<T extends StageType> = T extends "classMember"
  ? ClassMemberOptions
  : T extends "import"
  ? ImportOptions
  : T extends "namedExport"
  ? NamedExportOptions
  : T extends "property"
  ? PropertyOptions
  : T extends "arrayElement"
  ? ArrayElementOptions
  : T extends "case"
  ? CaseOptions
  : T extends "tsEnumMember"
  ? TSEnumMemberOptions
  : T extends "tsInterfaceBody"
  ? TSInterfaceBodyOptions
  : T extends "tsTypeAlias"
  ? TSTypeAliasOptions
  : T extends "tsTypeAliasConditional"
  ? TSTypeAliasConditionalOptions
  : T extends "tsTypeLiteral"
  ? TSTypeLiteralOptions
  : T extends "stringTemplate"
  ? StringTemplateOptions
  : BaseStageOptions;

type Stage<T extends StageType> = (
  j: JSCodeshift,
  col: Collection,
  opts: StageOptions<T>
) => Collection;

type StageFinder<T = FinderType> = {
  func: Finder;
  options: FinderOptions<T>;
};

type BaseStageOptions = {};

type ImportOptions = {
  isDefault?: boolean;
  source: string;
  importName: string;
  col?: Collection<import("jscodeshift").ImportDeclaration>;
} & BaseStageOptions;

type NamedExportOptions = {
  name: string;
  col?: Collection<import("jscodeshift").ExportNamedDeclaration>;
} & BaseStageOptions;

type PropertyOptions = {
  key: string;
  value: any;
  col?: Collection<import("jscodeshift").ObjectExpression>;
} & BaseStageOptions;

type ArrayElementOptions = {
  identifier?: boolean;
  col?: Collection<import("jscodeshift").ArrayExpression>;
} & (
  | { identifier: true; value: string }
  | { value: any; identifier: undefined }
  | { identifier: false; value: any }
) &
  BaseStageOptions;

type CaseOptions = {
  caseName: string;
  identifier?: boolean;
  statements: import("ast-types/gen/kinds").StatementKind[];
  col?: Collection<import("jscodeshift").SwitchStatement>;
} & BaseStageOptions;

type TSEnumMemberOptions = {
  key: string;
  value: string | number;
  col?: Collection<import("jscodeshift").TSEnumDeclaration>;
} & BaseStageOptions;

type TSInterfaceBodyOptions = {
  bodyStringTemplate: string;
  col?: Collection<import("jscodeshift").TSInterfaceBody>;
} & BaseStageOptions;

type TSTypeAliasOptions = {
  type:
    | "union"
    | "intersection"
    | "unionGroup"
    | "intersectionGroup"
    | "overwrite";
  stringTemplate: string;
  col?: Collection<import("jscodeshift").TSTypeAliasDeclaration>;
} & BaseStageOptions;

type TSTypeAliasConditionalOptions = {
  extendee: string;
  extender: string;
  trueClause: string;
  falseClause?: string;
  col?: Collection<import("jscodeshift").TSTypeAliasDeclaration>;
} & BaseStageOptions;

type TSTypeLiteralOptions = {
  stringTemplate: string;
  col?: Collection<import("jscodeshift").TSTypeLiteral>;
} & BaseStageOptions;

type StringTemplatePosition =
  | "afterImport"
  | "beforeImport"
  | "firstLine"
  | "lastLine";

type StringTemplateOptions = {
  template: string;
  position?: StringTemplatePosition;
  col?: Collection<import("jscodeshift").Program>;
} & BaseStageOptions;

type ClassMemberOptions = {
  stringTemplate: string;
  col?: Collection<import("jscodeshift").ClassBody>;
} & BaseStageOptions;
