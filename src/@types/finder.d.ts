type FinderType = "variableObject";

type VariableObjectOptions = {
  type: "variableObject";
  variableName: string;
};

type FinderOptions<T extends FinderType> = { type: T } & VariableObjectOptions;

type Finder = (
  j: JSCodeshift,
  col: Collection,
  opts: FinderOptions
) => Collection;
