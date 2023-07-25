type FinderType = "variableObject" | "switch" | "tsEnum";

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

type FinderOptions<T extends FinderType> =
  | VariableObjectFinderOptions
  | SwitchFinderOptions
  | TSEnumFinderOptions;

type Finder = (
  j: JSCodeshift,
  col: Collection,
  opts: FinderOptions
) => Collection;
