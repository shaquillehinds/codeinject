type FinderType = "variableObject" | "switch" | "tsEnum" | "tsInterfaceBody";

type BaseFinderOptions = {
  type: FinderType;
  name: string;
};

type VariableObjectFinderOptions = BaseFinderOptions & {
  type: "variableObject";
};

type SwitchFinderOptions = BaseFinderOptions & {
  type: "switch";
};

type TSEnumFinderOptions = BaseFinderOptions & {
  type: "tsEnum";
};

type InterfaceFinderBodyOptions = BaseFinderOptions & {
  type: "tsInterfaceBody";
};

type FinderOptions<T extends FinderType> =
  | VariableObjectFinderOptions
  | SwitchFinderOptions
  | TSEnumFinderOptions
  | InterfaceFinderBodyOptions;

type Finder = (
  j: JSCodeshift,
  col: Collection,
  opts: FinderOptions
) => Collection;
