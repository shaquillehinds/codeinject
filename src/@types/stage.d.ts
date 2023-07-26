type StageType =
  | "property"
  | "case"
  | "import"
  | "tsEnumMember"
  | "tsInterfaceBody"
  | "stringTemplate";

type BaseStageOptions<T> = {};

type ImportOptions = {
  isDefault?: boolean;
  source: string;
  importName: string;
  col?: Collection<import("jscodeshift").ImportDeclaration>;
};

type PropertyOptions = {
  identifier?: boolean;
  key: string;
  col?: Collection<import("jscodeshift").ObjectExpression>;
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
  : T extends "property"
  ? PropertyOptions
  : T extends "case"
  ? CaseOptions
  : T extends "tsEnumMember"
  ? TSEnumMemberOptions
  : T extends "tsInterfaceBody"
  ? TSInterfaceBodyOptions
  : T extends "stringTemplate"
  ? StringTemplateOptions
  : BaseStageOptions;

type Stage<T> = (
  j: JSCodeshift,
  col: Collection,
  opts: StageOptions<T>
) => Collection<T>;

type StageFinder<T = FinderType> = {
  func: Finder;
  options: FinderOptions<T>;
};
