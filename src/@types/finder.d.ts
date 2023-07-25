type FinderType = "variableObject" | "switch";

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

type FinderOptions<T extends FinderType> =
  | VariableObjectFinderOptions
  | SwitchFinderOptions;

type Finder = (
  j: JSCodeshift,
  col: Collection,
  opts: FinderOptions
) => Collection;
