enum StageTypeE {
  property = "property",
  arrayElement = "arrayElement",
  case = "case",
  import = "import",
  tsEnumMember = "tsEnumMember",
  tsInterfaceBody = "tsInterfaceBody",
  tsTypeAlias = "tsTypeAlias",
  tsTypeLiteral = "tsTypeLiteral",
  stringTemplate = "stringTemplate",
  namedExport = "namedExport",
}

type StageType = keyof typeof StageTypeE;

type BaseStageOptions<T> = {};

type ImportOptions = {
  isDefault?: boolean;
  source: string;
  importName: string;
  col?: Collection<import("jscodeshift").ImportDeclaration>;
};

type NamedExportOptions = {
  name: string;
  col?: Collection<import("jscodeshift").ExportNamedDeclaration>;
};

type PropertyOptions = {
  key: string;
  value: any;
  col?: Collection<import("jscodeshift").ObjectExpression>;
};

type ArrayElementOptions = {
  identifier?: boolean;
  col?: Collection<import("jscodeshift").ArrayExpression>;
} & (
  | { identifier: true; value: string }
  | { value: any; identifier: undefined }
  | { identifier: false; value: any }
);

type CaseOptions = {
  caseName: string;
  identifier?: boolean;
  statements: import("ast-types/gen/kinds").StatementKind[];
  col?: Collection<import("jscodeshift").SwitchStatement>;
};

type TSEnumMemberOptions = {
  key: string;
  value: string | number;
  col?: Collection<import("jscodeshift").TSEnumDeclaration>;
};

type TSInterfaceBodyOptions = {
  bodyStringTemplate: string;
  col?: Collection<import("jscodeshift").TSInterfaceBody>;
};

type TSTypeAliasOptions = {
  type:
    | "union"
    | "intersection"
    | "unionGroup"
    | "intersectionGroup"
    | "overwrite";
  stringTemplate: string;
  col?: Collection<import("jscodeshift").TSTypeAliasDeclaration>;
};

type TSTypeLiteralOptions = {
  stringTemplate: string;
  col?: Collection<import("jscodeshift").TSTypeLiteral>;
};

type StringTemplatePosition =
  | "afterImport"
  | "beforeImport"
  | "firstLine"
  | "lastLine";

type StringTemplateOptions = {
  template: string;
  position?: StringTemplatePosition;
  col?: Collection<import("jscodeshift").Program>;
};

type StageOptions<T extends StageType> = T extends "import"
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
