type StageType = "import" | "property";

type ImportOptions = {
  type: "import";
  isDefault?: boolean;
  source: string;
  importName: string;
};

type PropertyOptions = {
  type: "property";
  identifier?: boolean;
  key: string;
  col?: Collection<import("jscodeshift").ObjectExpression>;
} & (
  | { identifier: true; value: string }
  | { value: Literal; identifier: undefined }
  | { identifier: false; value: Literal }
);

type StageOptions<T extends StageType> = { type: T; col?: Collection } & (
  | ImportOptions
  | PropertyOptions
);

type Stage<T> = (
  j: JSCodeshift,
  col: Collection,
  opts: StageOptions<T>
) => Collection<T>;
