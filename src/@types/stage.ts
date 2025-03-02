import {
  Collection,
  JSCodeshift,
  ReturnStatement,
  TSTypeLiteral
} from "jscodeshift";
import { Finder, FinderOptions, FinderType } from "./finder";
import { StageTypeE } from "./stage.enums";
import InjectionPipeline from "@src/pipeline/Injection.pipeline";
import { PatternKind, StatementKind } from "ast-types/gen/kinds";

export type FunctionCollection =
  | Collection<import("jscodeshift").FunctionDeclaration>
  | Collection<
      | import("jscodeshift").FunctionExpression
      | import("jscodeshift").ArrowFunctionExpression
    >;

export type StageLogType = "update" | "create" | "directory";

export type StageType = keyof typeof StageTypeE;

export type StageOptions<T extends StageType> = T extends "returnStatement"
  ? ReturnStatementOptions
  : T extends "program"
  ? ProgramOptions
  : T extends "objectForAccessors"
  ? ObjectForAccessorsOptions
  : T extends "functionParams"
  ? FunctionParamsOptions
  : T extends "returnAllFunctionVariables"
  ? ReturnAllFunctionVariablesOptions
  : T extends "importsFromFile"
  ? ImportsFromFileOptions
  : T extends "returnObjectProperty"
  ? ReturnObjectPropertyOptions
  : T extends "functionBody"
  ? FunctionBodyOptions
  : T extends "classMember"
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
  : T extends "classConstructor"
  ? ClassConstructorOptions
  : T extends "tsNamespace"
  ? TSNamespace
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
  raw?: boolean;
  nodes?: import("jscodeshift").ImportDeclaration[];
  source?: string;
  importName?: string;
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
  stringTemplate?: string;
  nodes?: TSTypeLiteral[];

  col?: Collection<import("jscodeshift").TSTypeLiteral>;
} & BaseStageOptions;

export type JSXElementOptions = {
  stringTemplate: string;
  col?: Collection<import("jscodeshift").JSXElement>;
} & BaseStageOptions;

export type ProgramInjectPosition =
  | "afterImport"
  | "beforeImport"
  | "firstLine"
  | "lastLine";

export type StringTemplateOptions = {
  template: string;
  position?: ProgramInjectPosition;
  col?: Collection<import("jscodeshift").Program>;
} & BaseStageOptions;

export type ClassMemberOptions = {
  stringTemplate: string;
  col?: Collection<import("jscodeshift").ClassBody>;
} & BaseStageOptions;

export type ClassConstructorOptions = {
  stringTemplate: string;
  col?: Collection<import("jscodeshift").ClassBody>;
} & BaseStageOptions;

export type TSNamespace = {
  stringTemplate: string;
  col?: Collection<import("jscodeshift").TSModuleDeclaration>;
} & BaseStageOptions;

export type FunctionBodyOptions = {
  nodes?: import("jscodeshift").Node[];
  stringTemplate?: string;
  col?: FunctionCollection;
} & BaseStageOptions;

export type ReturnObjectPropertyOptions = {
  col?: FunctionCollection;
  nodes?: (
    | import("ast-types/gen/kinds").PropertyKind
    | import("ast-types/gen/kinds").ObjectMethodKind
    | import("ast-types/gen/kinds").ObjectPropertyKind
    | import("ast-types/gen/kinds").SpreadPropertyKind
    | import("ast-types/gen/kinds").SpreadElementKind
  )[];
  stringTemplate?: string;
} & BaseStageOptions;

export type ImportsFromFileOptions = {
  all?: boolean;
  origin: { source: string; type: "source" } | { text: string; type: "text" };
  col?: Collection<import("jscodeshift").ImportDeclaration>;
} & BaseStageOptions;

export type ReturnAllFunctionVariablesOptions = {
  col?: FunctionCollection;
} & BaseStageOptions;

type FunctionParamsOptions = {
  stringTemplate?: string;
  nodes?: PatternKind[];
  col?: FunctionCollection;
} & BaseStageOptions;

type ObjectForAccessorsOptions = {
  objectName: string;
  accessors: string[] | ((ip: InjectionPipeline) => string[]);
  ip?: InjectionPipeline;
  col?: Collection<import("jscodeshift").Program>;
} & BaseStageOptions;

type ProgramOptions = {
  nodes?: StatementKind[];
  stringTemplate?: string;
  injectionPosition?: ProgramInjectPosition;
  col?: Collection<import("jscodeshift").Program>;
} & BaseStageOptions;

type ReturnStatementOptions = {
  stringTemplate?: string;
  node?: ReturnStatement;
  col?: FunctionCollection;
} & BaseStageOptions;
