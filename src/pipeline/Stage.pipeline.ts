import { Collection, JSCodeshift } from "jscodeshift";
import { readFileSync, writeFileSync } from "fs";
import * as prettier from "prettier";
import chalk from "chalk";
import s from "./stages";
import f from "./finders";

export default class StagePipeline {
  protected ast?: Collection;
  protected asts: { location: string; ast: Collection }[] = [];
  constructor(
    protected j: JSCodeshift,
    protected fileLocation: string
  ) {}

  public parse(fileLocation?: string) {
    if (fileLocation) {
      if (this.fileLocation === fileLocation) {
        return this;
      }
      this.fileLocation = fileLocation;
    }
    const file = readFileSync(this.fileLocation, "utf-8");
    this.ast = this.j.withParser("tsx")(file);
    this.asts.push({ location: this.fileLocation, ast: this.ast });
    return this;
  }

  public stage<T extends StageType, F extends FinderType = FinderType>({
    finder,
    stage,
    options,
  }: {
    stage: Stage<T>;
    options: StageOptions<T> & { col?: Collection };
    finder: StageFinder<F>;
  }) {
    if (!this.ast) this.parse();
    if (!options.col)
      options.col = finder.func(this.j, this.ast!, finder.options);
    stage(this.j, this.ast!, options);
    return this;
  }

  public async finish() {
    if (this.asts.length === 0) {
      console.error(chalk("You don't have any asts loaded."));
      return this;
    }
    for (let ast of this.asts) {
      try {
        const updatedSource = await prettier.format(ast.ast.toSource(), {
          parser: "typescript",
        });
        writeFileSync(ast.location, updatedSource, "utf-8");
      } catch (error) {
        console.error(chalk.redBright(error));
      }
    }
    this.asts = [];
    return this;
  }

  public injectArrayElement(
    stageOptions: StageOptions<"arrayElement">,
    finderOptions: FinderOptions<"variableArray">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.arrayVariableFinder(this.j, this.ast!, finderOptions);
    s.injectArrayElementStage(this.j, this.ast!, stageOptions);
    return this;
  }

  public injectTSEnumMember(
    stageOptions: StageOptions<"tsEnumMember">,
    finderOptions: FinderOptions<"tsEnum">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.tsEnumFinder(this.j, this.ast!, finderOptions);
    s.injectTSEnumMemberStage(this.j, this.ast!, stageOptions);
    return this;
  }

  public injectTSTypeAliasConditional(
    stageOptions: StageOptions<"tsTypeAliasConditional">,
    finderOptions: FinderOptions<"tsTypeAlias">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.tsTypeAliasFinder(this.j, this.ast!, finderOptions);
    s.injectTSTypeAliasConditionalStage(this.j, this.ast!, stageOptions);
    return this;
  }

  public injectProperty(
    stageOptions: StageOptions<"property">,
    finderOptions: FinderOptions<"variableObject">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.objectVariableFinder(this.j, this.ast!, finderOptions);
    s.injectPropertyStage(this.j, this.ast!, stageOptions);
    return this;
  }

  public injectSwitchCase(
    stageOptions: StageOptions<"case">,
    finderOptions: FinderOptions<"switch">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.switchFinder(this.j, this.ast!, finderOptions);
    s.injectSwitchCaseStage(this.j, this.ast!, stageOptions);
    return this;
  }

  public injectTSTypeAlias(
    stageOptions: StageOptions<"tsTypeAlias">,
    finderOptions: FinderOptions<"tsTypeAlias">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.tsTypeAliasFinder(this.j, this.ast!, finderOptions);
    s.injectTSTypeAliasStage(this.j, this.ast!, stageOptions);
    return this;
  }

  public injectTSTypeLiteral(
    stageOptions: StageOptions<"tsTypeLiteral">,
    finderOptions: FinderOptions<"tsTypeLiteral">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.tsTypeLiteralFinder(this.j, this.ast!, finderOptions);
    s.injectTSTypeLiteralStage(this.j, this.ast!, stageOptions);
    return this;
  }

  public injectClassMember(
    stageOptions: StageOptions<"classMember">,
    finderOptions: FinderOptions<"classBody">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.classBodyFinder(this.j, this.ast!, finderOptions);
    s.injectClassMemberStage(this.j, this.ast!, stageOptions);
    return this;
  }

  public injectTSInterfaceBody(
    stageOptions: StageOptions<"tsInterfaceBody">,
    finderOptions: FinderOptions<"tsInterfaceBody">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.tsInterfaceBodyFinder(
      this.j,
      this.ast!,
      finderOptions
    );
    s.injectTSInterfaceBodyStage(this.j, this.ast!, stageOptions);
    return this;
  }

  public injectNamedExport(stageOptions: StageOptions<"namedExport">) {
    if (!this.ast) this.parse();
    stageOptions.col = f.exportFinder(this.j, this.ast!);
    s.injectNamedExportStage(this.j, this.ast!, stageOptions);
    return this;
  }

  public injectImport(stageOptions: StageOptions<"import">) {
    if (!this.ast) this.parse();
    stageOptions.col = f.importFinder(this.j, this.ast!);
    s.injectImportStage(this.j, this.ast!, stageOptions);
    return this;
  }

  public injectStringTemplate(stageOptions: StageOptions<"stringTemplate">) {
    if (!this.ast) this.parse();
    stageOptions.col = f.programFinder(this.j, this.ast!);
    s.injectStringTemplateStage(this.j, this.ast!, stageOptions);
    return this;
  }
}
