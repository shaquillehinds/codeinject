import { Collection, JSCodeshift } from "jscodeshift";
import { Finder, FinderOptions, FinderType } from "./finder";

export type StageLogType = "update" | "create" | "directory";

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
  classMember = "classMember",
  jsxElement = "jsxElement"
}

export type StageType = keyof typeof StageTypeE;

export type StageOptions<T extends StageType> = T extends "classMember"
  ? ClassMemberOptions
  : T extends "import"
  ? ImportOptions
  : T extends "namedExportProperty"
  ? NamedExportPropertyOptions
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
  : T extends "jsxElement"
  ? JSXElementOptions
  : BaseStageOptions;

export type StageOptionsAndIdName<T extends StageType> = StageOptions<T> & {
  idName: string;
};

export type Stage<T extends StageType> = (
  j: JSCodeshift,
  col: Collection,
  opts: StageOptions<T>
) => Collection;

export type StageFinder<T extends FinderType = FinderType> = {
  func: Finder;
  options: FinderOptions<T>;
};

export type BaseStageOptions = { forceInject?: boolean };

export type ImportOptions = {
  isDefault?: boolean;
  source: string;
  importName: string;
  col?: Collection<import("jscodeshift").ImportDeclaration>;
} & BaseStageOptions;

export type NamedExportPropertyOptions = {
  name: string;
  col?: Collection<import("jscodeshift").ExportNamedDeclaration>;
} & BaseStageOptions;

export type PropertyOptions = {
  property:
    | {
        key: string;
        value: any;
      }
    | string;
  stringTemplate?: string;
  col?: Collection<import("jscodeshift").ObjectExpression>;
} & BaseStageOptions;

export type ArrayElementOptions = {
  identifier?: boolean;
  col?: Collection<import("jscodeshift").ArrayExpression>;
} & (
  | { identifier: true; value: string }
  | { value: any; identifier: undefined }
  | { identifier: false; value: any }
) &
  BaseStageOptions;

export type CaseOptions = {
  caseName: string;
  identifier?: boolean;
  statements: import("ast-types/gen/kinds").StatementKind[];
  col?: Collection<import("jscodeshift").SwitchStatement>;
} & BaseStageOptions;

export type TSEnumMemberOptions = {
  key: string;
  value: string | number;
  col?: Collection<import("jscodeshift").TSEnumDeclaration>;
} & BaseStageOptions;

export type TSInterfaceBodyOptions = {
  bodyStringTemplate: string;
  col?: Collection<import("jscodeshift").TSInterfaceBody>;
} & BaseStageOptions;

export type TSTypeAliasOptions = {
  type:
    | "union"
    | "intersection"
    | "unionGroup"
    | "intersectionGroup"
    | "overwrite";
  stringTemplate: string;
  col?: Collection<import("jscodeshift").TSTypeAliasDeclaration>;
} & BaseStageOptions;

export type TSTypeAliasConditionalOptions = {
  extendee: string;
  extender: string;
  trueClause: string;
  falseClause?: string;
  constraint?: string;
  col?: Collection<import("jscodeshift").TSTypeAliasDeclaration>;
} & BaseStageOptions;

export type TSTypeLiteralOptions = {
  stringTemplate: string;
  col?: Collection<import("jscodeshift").TSTypeLiteral>;
} & BaseStageOptions;

export type JSXElementOptions = {
  stringTemplate: string;
  col?: Collection<import("jscodeshift").JSXElement>;
} & BaseStageOptions;

export type StringTemplatePosition =
  | "afterImport"
  | "beforeImport"
  | "firstLine"
  | "lastLine";

export type StringTemplateOptions = {
  template: string;
  position?: StringTemplatePosition;
  col?: Collection<import("jscodeshift").Program>;
} & BaseStageOptions;

export type ClassMemberOptions = {
  stringTemplate: string;
  col?: Collection<import("jscodeshift").ClassBody>;
} & BaseStageOptions;
