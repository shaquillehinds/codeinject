type FinderType =
  | "variableObject"
  | "variableArray"
  | "switch"
  | "tsEnum"
  | "import"
  | "program"
  | "tsInterfaceBody"
  | "tsTypeAlias"
  | "tsTypeLiteral";

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

type ProgramFinderOptions = BaseFinderOptions & {
  type: "program";
};

type FinderOptions<T extends FinderType> =
  | VariableObjectFinderOptions
  | VariableArrayFinderOptions
  | SwitchFinderOptions
  | TSEnumFinderOptions
  | InterfaceFinderBodyOptions
  | TSTypeAliasFinderOptions
  | TSTypeLiteralFinderOptions
  | ImportFinderOptions
  | ProgramFinderOptions;

type Finder = (
  j: JSCodeshift,
  col: Collection,
  opts: FinderOptions
) => Collection;
