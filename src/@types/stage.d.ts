type StageType = "property" | "case" | "import" | "tsEnum";

type BaseStageOptions<T> = {};

type ImportOptions = {
  isDefault?: boolean;
  source: string;
  importName: string;
  col?: Collection<import("jscodeshift").ImportDeclaration>;
};

type PropertyOptions = {
  identifier?: boolean;
  key: string;
  col?: Collection<import("jscodeshift").ObjectExpression>;
} & (
  | { identifier: true; value: string }
  | { value: any; identifier: undefined }
  | { identifier: false; value: any }
);

type CaseOptions = {
  caseName: string;
  identifier?: boolean;
  statements: import("ast-types/gen/kinds").StatementKind[];
  col?: Collection<import("jscodeshift").SwitchStatement>;
};

type TSEnumOptions = {
  key: string;
  value: string | number;
  col?: Collection<import("jscodeshift").TSEnumDeclaration>;
};

type StageOptions<T extends StageType> = T extends "import"
  ? ImportOptions
  : T extends "property"
  ? PropertyOptions
  : T extends "case"
  ? CaseOptions
  : T extends "tsEnum"
  ? TSEnumOptions
  : BaseStageOptions;

type Stage<T> = (
  j: JSCodeshift,
  col: Collection,
  opts: StageOptions<T>
) => Collection<T>;

type StageFinder<T = FinderType> = {
  func: Finder;
  options: FinderOptions<T>;
};
