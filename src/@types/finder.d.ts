type FinderType =
  | "variableObject"
  | "switch"
  | "tsEnum"
  | "tsInterfaceBody"
  | "import"
  | "program";

type BaseFinderOptions = {
  type: FinderType;
  name?: string;
};

type VariableObjectFinderOptions = BaseFinderOptions & {
  type: "variableObject";
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

type ImportFinderOptions = BaseFinderOptions & {
  type: "import";
};

type ProgramFinderOptions = BaseFinderOptions & {
  type: "program";
};

type FinderOptions<T extends FinderType> =
  | VariableObjectFinderOptions
  | SwitchFinderOptions
  | TSEnumFinderOptions
  | InterfaceFinderBodyOptions
  | ImportFinderOptions
  | ProgramFinderOptions;

type Finder = (
  j: JSCodeshift,
  col: Collection,
  opts: FinderOptions
) => Collection;
