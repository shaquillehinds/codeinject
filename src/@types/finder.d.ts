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

type FinderOptions<T extends FinderType> =
  | VariableObjectFinderOptions
  | VariableArrayFinderOptions
  | SwitchFinderOptions
  | TSEnumFinderOptions
  | InterfaceFinderBodyOptions
  | TSTypeAliasFinderOptions
  | TSTypeLiteralFinderOptions
  | ImportFinderOptions
  | ExportFinderOptions
  | DefaultExportFinderOptions
  | ProgramFinderOptions;

type Finder = (
  j: JSCodeshift,
  col: Collection,
  opts: FinderOptions
) => Collection;

type BaseFinderOptions = {
  type: FinderType;
  name?: string;
};

type VariableObjectFinderOptions = BaseFinderOptions & {
  type: "variableObject";
  name: string;
};

type VariableArrayFinderOptions = BaseFinderOptions & {
  type: "variableArray";
  name: string;
};

type SwitchFinderOptions = BaseFinderOptions & {
  type: "switch";
  name: string;
};

type TSEnumFinderOptions = BaseFinderOptions & {
  type: "tsEnum";
  name: string;
};

type InterfaceFinderBodyOptions = BaseFinderOptions & {
  type: "tsInterfaceBody";
  name: string;
};

type TSTypeAliasFinderOptions = BaseFinderOptions & {
  type: "tsTypeAlias";
  name: string;
};

type TSTypeLiteralFinderOptions = BaseFinderOptions & {
  type: "tsTypeLiteral";
  name: string;
};

type ImportFinderOptions = BaseFinderOptions & {
  type: "import";
};

type ExportFinderOptions = BaseFinderOptions & {
  type: "export";
};

type DefaultExportFinderOptions = BaseFinderOptions & {
  type: "defaultExport";
};

type ProgramFinderOptions = BaseFinderOptions & {
  type: "program";
};
