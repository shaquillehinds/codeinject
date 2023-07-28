import { Collection } from "jscodeshift";

export enum FinderTypeE {
  variableObject = "variableObject",
  variableArray = "variableArray",
  switch = "switch",
  tsEnum = "tsEnum",
  import = "import",
  export = "export",
  defaultExport = "defaultExport",
  program = "program",
  tsInterfaceBody = "tsInterfaceBody",
  tsTypeAlias = "tsTypeAlias",
  tsTypeLiteral = "tsTypeLiteral",
  classBody = "classBody",
}

export type FinderType = keyof typeof FinderTypeE;

export type FinderOptions<T extends FinderType> = T extends "classBody"
  ? classBodyFinderOptions
  : T extends "variableObject"
  ? VariableObjectFinderOptions
  : T extends "variableArray"
  ? VariableArrayFinderOptions
  : T extends "switch"
  ? SwitchFinderOptions
  : T extends "tsEnum"
  ? TSEnumFinderOptions
  : T extends "tsInterfaceBody"
  ? InterfaceFinderBodyOptions
  : T extends "tsTypeAlias"
  ? TSTypeAliasFinderOptions
  : T extends "tsTypeLiteral"
  ? TSTypeLiteralFinderOptions
  : T extends "import"
  ? ImportFinderOptions
  : T extends "export"
  ? ExportFinderOptions
  : T extends "defaultExport"
  ? DefaultExportFinderOptions
  : T extends "program"
  ? ProgramFinderOptions
  : BaseFinderOptions;

export type Finder = (
  j: import("jscodeshift").JSCodeshift,
  col: Collection,
  opts: FinderOptions<FinderType>
) => Collection;

export type BaseFinderOptions = {};

export type VariableObjectFinderOptions = BaseFinderOptions & {
  name: string;
};

export type VariableArrayFinderOptions = BaseFinderOptions & {
  name: string;
};

export type SwitchFinderOptions = BaseFinderOptions & {
  name: string;
};

export type TSEnumFinderOptions = BaseFinderOptions & {
  name: string;
};

export type InterfaceFinderBodyOptions = BaseFinderOptions & {
  name: string;
};

export type TSTypeAliasFinderOptions = BaseFinderOptions & {
  name: string;
};

export type TSTypeLiteralFinderOptions = BaseFinderOptions & {
  name: string;
};

export type ImportFinderOptions = BaseFinderOptions & {};

export type ExportFinderOptions = BaseFinderOptions & {};

export type DefaultExportFinderOptions = BaseFinderOptions & {};

export type ProgramFinderOptions = BaseFinderOptions & {};

export type classBodyFinderOptions = BaseFinderOptions & {
  name: string;
};
