import j, { Collection } from "jscodeshift";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { Options, format } from "prettier";
import chalk from "chalk";
import s from "./stages";
import f from "./finders";
import { execSync } from "child_process";
import {
  Stage,
  StageFinder,
  StageLogType,
  StageOptions,
  StageType
} from "@src/@types/stage";
import { FinderOptions, FinderType } from "@src/@types/finder";
import { FileFromTemplateOptions } from "@src/@types";

class InjectionPipeline {
  protected ast?: Collection;
  protected asts: { location: string; ast: Collection }[] = [];
  protected newFiles: { location: string; content: string }[] = [];
  protected updated: string[] = [];
  protected created: string[] = [];
  constructor(
    protected fileLocation: string,
    public prettierOptions?: Options
  ) {
    this.updated.push(`${chalk.yellow("[Updating]")}: ${fileLocation}`);
  }

  public get _ast() {
    return this.ast;
  }

  public parse(fileLocation?: string) {
    if (fileLocation) {
      if (this.fileLocation === fileLocation) {
        return this;
      }
      this.fileLocation = fileLocation;
      this.updated.push(`${chalk.yellow("[Updating]")}: ${fileLocation}`);
    }
    const file = readFileSync(this.fileLocation, "utf-8");
    this.ast = j.withParser("tsx")(file);
    this.asts.push({ location: this.fileLocation, ast: this.ast });
    return this;
  }

  public stage<T extends StageType, F extends FinderType = FinderType>({
    finder,
    stage,
    options
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
        const updatedSource = await format(ast.ast.toSource(), {
          parser: "typescript",
          ...this.prettierOptions
        });
        writeFileSync(ast.location, updatedSource, "utf-8");
      } catch (error) {
        console.error(`${chalk.bgRed("[Error]")}: ${error}`);
      }
    }

    const updateString = this.updated.join("\n");
    console.info(updateString);

    this.newFiles.forEach((newFile, index) => {
      try {
        writeFileSync(newFile.location, newFile.content, "utf-8");
        console.info(this.created[index]);
      } catch (error) {
        console.error(`${chalk.bgRed("[Error]")}: ${error}`);
      }
    });

    if (filesToOpen && filesToOpen.length > 0) {
      filesToOpen.forEach(file => execSync(`code ${file}`));
    }
    this.asts = [];
    this.newFiles = [];
    this.updated = [];
    this.created = [];
    return this;
  }

  protected addLog(log: string, type: StageLogType = "update") {
    if (type === "update")
      this.updated.push(`${chalk.cyanBright("[Update]")}: ${log}`);
    else if (type === "create")
      this.created.push(`${chalk.greenBright("[Create]")}: ${log}`);
  }

  public injectFolder(path: string) {
    if (!this.ast) this.parse();
    mkdirSync(path);
    return this;
  }

  public injectFileFromTemplate(options: FileFromTemplateOptions) {
    if (!this.ast) this.parse();
    let content = readFileSync(options.templatePath, "utf-8");
    for (let { keyword, replacement } of options.replaceKeywords) {
      content = content.replaceAll(keyword, replacement);
    }
    this.newFiles.push({ content, location: options.newFilePath });
    this.addLog(options.newFilePath, "create");
    return this;
  }

  public injectArrayElement(
    stageOptions: StageOptions<"arrayElement">,
    finderOptions: FinderOptions<"variableArray">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.arrayVariableFinder(j, this.ast!, finderOptions);
    s.injectArrayElementStage(j, this.ast!, stageOptions);
    this.addLog("Injected array element.");
    return this;
  }

  public injectTSEnumMember(
    stageOptions: StageOptions<"tsEnumMember">,
    finderOptions: FinderOptions<"tsEnum">
  ) {
    if (!this.ast) this.parse();
    s.injectTSEnumMemberStage(j, this.ast!, {
      ...stageOptions,
      ...f.tsEnumFinder(j, this.ast!, finderOptions)
    });
    this.addLog(`Injected injected enum member: ${stageOptions.key}`);
    return this;
  }

  public injectTSTypeAliasConditional(
    stageOptions: StageOptions<"tsTypeAliasConditional">,
    finderOptions: FinderOptions<"tsTypeAlias">
  ) {
    if (!this.ast) this.parse();
    s.injectTSTypeAliasConditionalStage(j, this.ast!, {
      ...stageOptions,
      ...f.tsTypeAliasFinder(j, this.ast!, finderOptions)
    });
    this.addLog("Injected type alias condition.");
    return this;
  }

  public injectProperty(
    stageOptions: StageOptions<"property">,
    finderOptions: FinderOptions<"variableObject">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.objectVariableFinder(j, this.ast!, finderOptions);
    s.injectPropertyStage(j, this.ast!, stageOptions);
    this.addLog(`Injected object property: ${stageOptions.key}`);
    return this;
  }

  public injectSwitchCase(
    stageOptions: StageOptions<"case">,
    finderOptions: FinderOptions<"switch">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.switchFinder(j, this.ast!, finderOptions);
    s.injectSwitchCaseStage(j, this.ast!, stageOptions);
    this.addLog(`Injected switch case: ${stageOptions.caseName}`);
    return this;
  }

  public injectTSTypeAlias(
    stageOptions: StageOptions<"tsTypeAlias">,
    finderOptions: FinderOptions<"tsTypeAlias">
  ) {
    if (!this.ast) this.parse();
    s.injectTSTypeAliasStage(j, this.ast!, {
      ...stageOptions,
      ...f.tsTypeAliasFinder(j, this.ast!, finderOptions)
    });
    this.addLog(`Injected type alias: ${stageOptions.type}`);
    return this;
  }

  public injectTSTypeLiteral(
    stageOptions: StageOptions<"tsTypeLiteral">,
    finderOptions: FinderOptions<"tsTypeLiteral">
  ) {
    if (!this.ast) this.parse();
    s.injectTSTypeLiteralStage(j, this.ast!, {
      ...stageOptions,
      ...f.tsTypeLiteralFinder(j, this.ast!, finderOptions)
    });
    this.addLog(`Injected type literal`);
    return this;
  }

  public injectClassMember(
    stageOptions: StageOptions<"classMember">,
    finderOptions: FinderOptions<"classBody">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.classBodyFinder(j, this.ast!, finderOptions);
    s.injectClassMemberStage(j, this.ast!, stageOptions);
    this.addLog(`Injected class member`);
    return this;
  }

  public injectTSInterfaceBody(
    stageOptions: StageOptions<"tsInterfaceBody">,
    finderOptions: FinderOptions<"tsInterfaceBody">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.tsInterfaceBodyFinder(j, this.ast!, finderOptions);
    s.injectTSInterfaceBodyStage(j, this.ast!, stageOptions);
    this.addLog(`Injected interface body`);
    return this;
  }

  public injectNamedExportProperty(
    stageOptions: StageOptions<"namedExportProperty">
  ) {
    if (!this.ast) this.parse();
    s.injectNamedExportPropertyStage(j, this.ast!, {
      ...stageOptions,
      ...f.exportFinder(j, this.ast!)
    });
    this.addLog(`Injected named export: ${stageOptions.name}`);
    return this;
  }

  public injectImport(stageOptions: StageOptions<"import">) {
    if (!this.ast) this.parse();
    s.injectImportStage(j, this.ast!, {
      ...stageOptions,
      col: f.importFinder(j, this.ast!)
    });
    this.addLog(`Injected import: ${stageOptions.importName}`);
    return this;
  }

  public injectStringTemplate(stageOptions: StageOptions<"stringTemplate">) {
    if (!this.ast) this.parse();
    stageOptions.col = f.programFinder(j, this.ast!);
    s.injectStringTemplateStage(j, this.ast!, stageOptions);
    this.addLog(`Injected string template code`);
    return this;
  }
}

export default InjectionPipeline;
