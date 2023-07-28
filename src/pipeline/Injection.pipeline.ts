import j, { Collection } from "jscodeshift";
import { readFileSync, writeFileSync } from "fs";
import * as prettier from "prettier";
import chalk from "chalk";
import s from "./stages";
import f from "./finders";
import { execSync } from "child_process";
import { Stage, StageFinder, StageOptions, StageType } from "@src/@types/stage";
import { FinderOptions, FinderType } from "@src/@types/finder";

class InjectionPipeline {
  protected ast?: Collection;
  protected asts: { location: string; ast: Collection }[] = [];
  protected updates: string[] = [];
  constructor(
    protected fileLocation: string,
    public prettierOptions?: prettier.Options
  ) {
    this.updates.push(`${chalk.yellow("[Updating]")}: ${fileLocation}`);
  }

  public parse(fileLocation?: string) {
    if (fileLocation) {
      if (this.fileLocation === fileLocation) {
        return this;
      }
      this.fileLocation = fileLocation;
      this.updates.push(`${chalk.yellow("[Updating]")}: ${fileLocation}`);
    }
    const file = readFileSync(this.fileLocation, "utf-8");
    this.ast = j.withParser("tsx")(file);
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
    if (!options.col) options.col = finder.func(j, this.ast!, finder.options);
    stage(j, this.ast!, options);
    return this;
  }

  public async finish(filesToOpen?: string[]) {
    if (this.asts.length === 0) {
      console.error(chalk.bgRed("You don't have any asts loaded."));
      return this;
    }
    for (let ast of this.asts) {
      try {
        const updatedSource = await prettier.format(
          ast.ast.toSource(),
          this.prettierOptions
        );
        writeFileSync(ast.location, updatedSource, "utf-8");
        const updateString = this.updates.join("\n");
        console.info(updateString);
        if (filesToOpen && filesToOpen.length > 0) {
          filesToOpen.forEach((file) => execSync(`code ${file}`));
        }
      } catch (error) {
        console.error(chalk.redBright(error));
      }
    }
    this.asts = [];
    return this;
  }

  protected addUpdate(update: string) {
    this.updates.push(`${chalk.cyanBright("[Update]")}: ${update}`);
  }

  public injectArrayElement(
    stageOptions: StageOptions<"arrayElement">,
    finderOptions: FinderOptions<"variableArray">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.arrayVariableFinder(j, this.ast!, finderOptions);
    s.injectArrayElementStage(j, this.ast!, stageOptions);
    this.addUpdate("Injected array element.");
    return this;
  }

  public injectTSEnumMember(
    stageOptions: StageOptions<"tsEnumMember">,
    finderOptions: FinderOptions<"tsEnum">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.tsEnumFinder(j, this.ast!, finderOptions);
    s.injectTSEnumMemberStage(j, this.ast!, stageOptions);
    this.addUpdate(`Injected injected enum member: ${stageOptions.key}`);
    return this;
  }

  public injectTSTypeAliasConditional(
    stageOptions: StageOptions<"tsTypeAliasConditional">,
    finderOptions: FinderOptions<"tsTypeAlias">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.tsTypeAliasFinder(j, this.ast!, finderOptions);
    s.injectTSTypeAliasConditionalStage(j, this.ast!, stageOptions);
    this.addUpdate("Injected type alias condition.");
    return this;
  }

  public injectProperty(
    stageOptions: StageOptions<"property">,
    finderOptions: FinderOptions<"variableObject">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.objectVariableFinder(j, this.ast!, finderOptions);
    s.injectPropertyStage(j, this.ast!, stageOptions);
    this.addUpdate(`Injected object property: ${stageOptions.key}`);
    return this;
  }

  public injectSwitchCase(
    stageOptions: StageOptions<"case">,
    finderOptions: FinderOptions<"switch">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.switchFinder(j, this.ast!, finderOptions);
    s.injectSwitchCaseStage(j, this.ast!, stageOptions);
    this.addUpdate(`Injected switch case: ${stageOptions.caseName}`);
    return this;
  }

  public injectTSTypeAlias(
    stageOptions: StageOptions<"tsTypeAlias">,
    finderOptions: FinderOptions<"tsTypeAlias">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.tsTypeAliasFinder(j, this.ast!, finderOptions);
    s.injectTSTypeAliasStage(j, this.ast!, stageOptions);
    this.addUpdate(`Injected type alias: ${stageOptions.type}`);
    return this;
  }

  public injectTSTypeLiteral(
    stageOptions: StageOptions<"tsTypeLiteral">,
    finderOptions: FinderOptions<"tsTypeLiteral">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.tsTypeLiteralFinder(j, this.ast!, finderOptions);
    s.injectTSTypeLiteralStage(j, this.ast!, stageOptions);
    this.addUpdate(`Injected type literal`);
    return this;
  }

  public injectClassMember(
    stageOptions: StageOptions<"classMember">,
    finderOptions: FinderOptions<"classBody">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.classBodyFinder(j, this.ast!, finderOptions);
    s.injectClassMemberStage(j, this.ast!, stageOptions);
    this.addUpdate(`Injected class member`);
    return this;
  }

  public injectTSInterfaceBody(
    stageOptions: StageOptions<"tsInterfaceBody">,
    finderOptions: FinderOptions<"tsInterfaceBody">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.tsInterfaceBodyFinder(j, this.ast!, finderOptions);
    s.injectTSInterfaceBodyStage(j, this.ast!, stageOptions);
    this.addUpdate(`Injected interface body`);
    return this;
  }

  public injectNamedExport(stageOptions: StageOptions<"namedExport">) {
    if (!this.ast) this.parse();
    stageOptions.col = f.exportFinder(j, this.ast!);
    s.injectNamedExportStage(j, this.ast!, stageOptions);
    this.addUpdate(`Injected named export: ${stageOptions.name}`);
    return this;
  }

  public injectImport(stageOptions: StageOptions<"import">) {
    if (!this.ast) this.parse();
    stageOptions.col = f.importFinder(j, this.ast!);
    s.injectImportStage(j, this.ast!, stageOptions);
    this.addUpdate(`Injected import: ${stageOptions.importName}`);
    return this;
  }

  public injectStringTemplate(stageOptions: StageOptions<"stringTemplate">) {
    if (!this.ast) this.parse();
    stageOptions.col = f.programFinder(j, this.ast!);
    s.injectStringTemplateStage(j, this.ast!, stageOptions);
    this.addUpdate(`Injected string template code`);
    return this;
  }
}

export default InjectionPipeline;
