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

type FinderOptions<T extends FinderType> = T extends FinderTypeE.variableObject
  ? VariableObjectFinderOptions
  : T extends FinderTypeE.variableArray
  ? VariableArrayFinderOptions
  : T extends FinderTypeE.switch
  ? SwitchFinderOptions
  : T extends FinderTypeE.tsEnum
  ? TSEnumFinderOptions
  : T extends FinderTypeE.tsInterfaceBody
  ? InterfaceFinderBodyOptions
  : T extends FinderTypeE.tsTypeAlias
  ? TSTypeAliasFinderOptions
  : T extends FinderTypeE.tsTypeLiteral
  ? TSTypeLiteralFinderOptions
  : T extends FinderTypeE.import
  ? ImportFinderOptions
  : T extends FinderTypeE.export
  ? ExportFinderOptions
  : T extends FinderTypeE.defaultExport
  ? DefaultExportFinderOptions
  : T extends FinderTypeE.program
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
