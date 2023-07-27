enum FinderTypeE {
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
}

type FinderType = keyof typeof FinderTypeE;

type FinderOptions<T extends FinderType> = T extends "variableObject"
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

type Finder = (
  j: JSCodeshift,
  col: Collection,
  opts: FinderOptions
) => Collection;

type BaseFinderOptions = {};

type VariableObjectFinderOptions = BaseFinderOptions & {
  name: string;
};

type VariableArrayFinderOptions = BaseFinderOptions & {
  name: string;
};

type SwitchFinderOptions = BaseFinderOptions & {
  name: string;
};

type TSEnumFinderOptions = BaseFinderOptions & {
  name: string;
};

type InterfaceFinderBodyOptions = BaseFinderOptions & {
  name: string;
};

type TSTypeAliasFinderOptions = BaseFinderOptions & {
  name: string;
};

type TSTypeLiteralFinderOptions = BaseFinderOptions & {
  name: string;
};

type ImportFinderOptions = BaseFinderOptions & {};

type ExportFinderOptions = BaseFinderOptions & {};

type DefaultExportFinderOptions = BaseFinderOptions & {};

type ProgramFinderOptions = BaseFinderOptions & {};
