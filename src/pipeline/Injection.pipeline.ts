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

const chalkGold = chalk.rgb(244, 184, 0);

class InjectionPipeline {
  protected ast?: Collection;
  protected asts: { location: string; ast: Collection }[] = [];
  protected newFiles: { location: string; content: string }[] = [];
  protected newDirPaths: string[] = [];
  protected updated: string[] = [];
  protected created: string[] = [];
  protected newDirLogs: string[] = [];
  constructor(
    protected fileLocation: string,
    public prettierOptions?: Options
  ) {
    this.updated.push(chalk.bold.cyanBright(`\nUpdating >> ${fileLocation}`));
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
      this.updated.push(chalk.bold.cyanBright(`\nUpdating >> ${fileLocation}`));
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

    this.newDirPaths.forEach((dir, index) => {
      try {
        mkdirSync(dir);
        console.info(this.newDirLogs[index]);
      } catch (error) {
        console.error(`${chalk.bgRed("[Error]")}: ${error}`);
      }
    });

    this.newFiles.forEach((newFile, index) => {
      try {
        writeFileSync(newFile.location, newFile.content, "utf-8");
        console.info(this.created[index]);
      } catch (error) {
        console.error(`${chalk.bgRed("[Error]")}: ${error}`);
      }
    });

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

    if (filesToOpen && filesToOpen.length > 0) {
      filesToOpen.forEach(file => execSync(`code ${file}`));
    }
    this.asts = [];
    this.newFiles = [];
    this.newDirPaths = [];
    this.updated = [];
    this.created = [];
    this.newDirLogs = [];
    return this;
  }

  protected addLog(log: string, type: StageLogType = "update") {
    if (type === "update")
      this.updated.push(`${chalkGold("[Update]")}: ${log}`);
    else if (type === "create")
      this.created.push(`${chalk.greenBright("[Create]")}: ${log}`);
    else if (type === "directory")
      this.newDirLogs.push(`${chalk.bold.green("+ [Directory]")}: ${log}`);
  }

  public injectDirectory(path: string) {
    if (!this.ast) this.parse();
    this.newDirPaths.push(path);
    this.addLog(path, "directory");
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
    finderOpts: FinderOptions<"variableArray">
  ) {
    if (!this.ast) this.parse();
    const found = f.arrayVariableFinder(j, this.ast!, finderOpts);
    const newStageOpts = { ...stageOptions, ...found };
    s.injectArrayElementStage(j, this.ast!, newStageOpts);
    this.addLog(`Injected array element to array: ${found.idName}`);
    return this;
  }

  public injectTSEnumMember(
    stageOptions: StageOptions<"tsEnumMember">,
    finderOpts: FinderOptions<"tsEnum">
  ) {
    if (!this.ast) this.parse();
    const found = f.tsEnumFinder(j, this.ast!, finderOpts);
    const newStageOpts = { ...stageOptions, ...found };
    s.injectTSEnumMemberStage(j, this.ast!, newStageOpts);
    this.addLog(
      `Injected enum member ${stageOptions.key} to enum: ${found.idName}`
    );
    return this;
  }

  public injectTSTypeAliasConditional(
    stageOptions: StageOptions<"tsTypeAliasConditional">,
    finderOpts: FinderOptions<"tsTypeAlias">
  ) {
    if (!this.ast) this.parse();
    const found = f.tsTypeAliasFinder(j, this.ast!, finderOpts);
    const newStageOpts = { ...stageOptions, ...found };
    s.injectTSTypeAliasConditionalStage(j, this.ast!, newStageOpts);
    this.addLog(`Injected type conditional to type alias: ${found.idName}`);
    return this;
  }

  public injectProperty(
    stageOptions: StageOptions<"property">,
    finderOpts: FinderOptions<"variableObject">
  ) {
    if (!this.ast) this.parse();
    const found = f.objectVariableFinder(j, this.ast!, finderOpts);
    const newStageOpts = { ...stageOptions, ...found };
    s.injectPropertyStage(j, this.ast!, newStageOpts);
    this.addLog(
      `Injected object property ${stageOptions.property} to: ${found.idName}`
    );
    return this;
  }

  public injectSwitchCase(
    stageOptions: StageOptions<"case">,
    finderOpts: FinderOptions<"switch">
  ) {
    if (!this.ast) this.parse();
    const found = f.switchFinder(j, this.ast!, finderOpts);
    const newStageOpts = { ...stageOptions, ...found };
    s.injectSwitchCaseStage(j, this.ast!, newStageOpts);
    this.addLog(
      `Injected switch case ${stageOptions.caseName} to switch statement: ${found.idName}`
    );
    return this;
  }

  public injectTSTypeAlias(
    stageOptions: StageOptions<"tsTypeAlias">,
    finderOpts: FinderOptions<"tsTypeAlias">
  ) {
    if (!this.ast) this.parse();
    const found = f.tsTypeAliasFinder(j, this.ast!, finderOpts);
    const newStageOpts = { ...stageOptions, ...found };
    s.injectTSTypeAliasStage(j, this.ast!, newStageOpts);
    this.addLog(`Injected type alias: ${stageOptions.type}`);
    return this;
  }

  public injectTSTypeLiteral(
    stageOptions: StageOptions<"tsTypeLiteral">,
    finderOpts: FinderOptions<"tsTypeLiteral">
  ) {
    if (!this.ast) this.parse();
    const found = f.tsTypeLiteralFinder(j, this.ast!, finderOpts);
    const newStageOpts = { ...stageOptions, ...found };
    s.injectTSTypeLiteralStage(j, this.ast!, newStageOpts);
    this.addLog(`Injected to type literal: ${found.idName}`);
    return this;
  }

  public injectClassMember(
    stageOptions: StageOptions<"classMember">,
    finderOpts: FinderOptions<"classBody">
  ) {
    if (!this.ast) this.parse();
    const found = f.classBodyFinder(j, this.ast!, finderOpts);
    const newStageOpts = { ...stageOptions, ...found };
    s.injectClassMemberStage(j, this.ast!, newStageOpts);
    this.addLog(`Injected a class member to class: ${found.idName}`);
    return this;
  }

  public injectClassConstructor(
    stageOptions: StageOptions<"classConstructor">,
    finderOpts: FinderOptions<"classBody">
  ) {
    if (!this.ast) this.parse();
    const found = f.classBodyFinder(j, this.ast!, finderOpts);
    const newStageOpts = { ...stageOptions, ...found };
    s.injectClassConstructorStage(j, this.ast!, newStageOpts);
    this.addLog(`Injected a constructor to class: ${found.idName}`);
    return this;
  }

  public injectTSInterfaceBody(
    stageOptions: StageOptions<"tsInterfaceBody">,
    finderOpts: FinderOptions<"tsInterfaceBody">
  ) {
    if (!this.ast) this.parse();
    const found = f.tsInterfaceBodyFinder(j, this.ast!, finderOpts);
    const newStageOpts = { ...stageOptions, ...found };
    s.injectTSInterfaceBodyStage(j, this.ast!, newStageOpts);
    this.addLog(`Injected to interface: ${found.idName}`);
    return this;
  }

  public injectJSXElement(
    stageOptions: StageOptions<"jsxElement">,
    finderOpts: FinderOptions<"jsxElement">
  ) {
    if (!this.ast) this.parse();
    const found = f.jsxElementFinder(j, this.ast!, finderOpts);
    const newStageOpts = { ...stageOptions, ...found };
    s.injectJSXElementStage(j, this.ast!, newStageOpts);
    this.addLog(`Injected to jsx element: ${found.idName}`);
    return this;
  }

  public injectTSNamespace(
    stageOptions: StageOptions<"tsNamespace">,
    finderOpts: FinderOptions<"tsNamespace">
  ) {
    if (!this.ast) this.parse();
    const found = f.tsNamespaceFinder(j, this.ast!, finderOpts);
    const newStageOpts = { ...stageOptions, ...found };
    s.injectTSNamespaceStage(j, this.ast!, newStageOpts);
    this.addLog(`Injected namespace: ${found.idName}`);
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
    this.addLog(`Injected export property: ${stageOptions.name}`);
    return this;
  }

  public injectImport(stageOptions: StageOptions<"import">) {
    if (!this.ast) this.parse();
    s.injectImportStage(j, this.ast!, {
      ...stageOptions,
      col: f.importFinder(j, this.ast!)
    });
    this.addLog(
      `Injected${stageOptions.importName ? " default " : " "}import: ${
        stageOptions.importName
      }`
    );
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
