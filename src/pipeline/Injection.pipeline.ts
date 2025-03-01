import j, { Collection, Node } from "jscodeshift";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { Options, format } from "prettier";
import chalk from "chalk";
import s, { StagesKey } from "./stages";
import f, { FindersKey } from "./finders";
import { execSync } from "child_process";
import {
  FunctionCollection,
  Stage,
  StageFinder,
  StageLogType,
  StageOptions,
  StageType
} from "@src/@types/stage";
import { FinderOptions, FinderType } from "@src/@types/finder";
import { FileFromTemplateOptions } from "@src/@types";
import nodeGrouper, {
  NodeGrouperProps,
  NodeGrouperType,
  VariableType
} from "@src/utils/nodeGrouper";
import getDefinedVariableName from "@src/utils/getDefinedVariableName";

const chalkGold = chalk.rgb(244, 184, 0);

type FileRecords = {
  variableNames: string[];
  collectedVariableNames: boolean;
  [key: string]: any;
};

type StoreRecords = {
  [key: string]: FileRecords;
};

class InjectionPipeline {
  public static getFinder<K extends FindersKey>(finder: K) {
    const finderFunc = f[finder];
    return finderFunc;
  }

  public static getStage<K extends StagesKey>(stage: K) {
    const stageFunc = s[stage];
    return stageFunc;
  }

  public static getName(col: Collection) {
    try {
      return col.find(j.Identifier).get().value.name as string;
    } catch (error) {
      return null;
    }
  }

  public static getNames(col: Collection) {
    try {
      return col
        .find(j.Identifier)
        .paths()
        .map(p => p.value.name);
    } catch (error) {
      return [];
    }
  }

  public static getBodyNodes(col: Collection) {
    try {
      return col.find(j.BlockStatement).get().value.body as Node[];
    } catch (error) {
      return null;
    }
  }

  public static getFunctionParams(col: FunctionCollection) {
    try {
      return col.at(0).nodes()[0].params;
    } catch (error) {
      return [];
    }
  }

  public static nodeGrouper<
    T extends NodeGrouperType,
    V extends VariableType,
    C extends VariableType
  >(props: NodeGrouperProps<T, V, C>) {
    return nodeGrouper<T, V, C>(props);
  }

  protected ast?: Collection;
  protected asts: { location: string; ast: Collection }[] = [];
  protected newFiles: { location: string; content: string }[] = [];
  protected newDirPaths: string[] = [];
  protected updated: string[] = [];
  protected created: string[] = [];
  protected newDirLogs: string[] = [];
  protected _originalFileContent: string = "";

  public pipelineStore: StoreRecords = {};

  constructor(
    protected fileLocation: string,
    public prettierOptions?: Options
  ) {
    this.updated.push(chalk.bold.cyanBright(`\nUpdating >> ${fileLocation}`));
  }

  public get _ast() {
    return this.ast;
  }

  public get location() {
    return this.fileLocation;
  }

  public get updatedFileContent() {
    return this.ast?.toSource() || "";
  }

  public get originalFileContent() {
    return this._originalFileContent;
  }

  public getOriginalFileContent(
    func: (content: string, currentPipeline: InjectionPipeline) => void
  ) {
    func(this._originalFileContent, this);
    return this;
  }

  public get variableNames(): string[] {
    if (this.pipelineStore[this.location].collectedVariableNames)
      return this.pipelineStore[this.location].variableNames || [];
    this._ast!.find(j.VariableDeclaration).forEach(p => {
      const names = getDefinedVariableName(p.node);
      for (const name of names)
        if (name) this.pipelineStore[this.location].variableNames.push(name);
    });
    this._ast!.find(j.FunctionDeclaration).forEach(p => {
      const name = p.node.id?.name;
      if (name) this.pipelineStore[this.location].variableNames.push(name);
    });
    return this.pipelineStore[this.location].variableNames;
  }

  public storeFileVariables() {
    this.variableNames;
    return this;
  }

  public customInject(func: (currentPipeline: InjectionPipeline) => void) {
    func(this);
    return this;
  }

  public parse(fileLocation?: string) {
    if (fileLocation) {
      if (this.fileLocation === fileLocation) {
        return this;
      }
      this.fileLocation = fileLocation;
      if (!this.pipelineStore[fileLocation])
        this.pipelineStore[fileLocation] = {
          variableNames: [],
          collectedVariableNames: false
        };
      this.updated.push(chalk.bold.cyanBright(`\nUpdating >> ${fileLocation}`));
    }
    const file = readFileSync(this.fileLocation, "utf-8");
    this._originalFileContent = file;
    this.ast = j.withParser("tsx")(file);
    this.asts.push({ location: this.fileLocation, ast: this.ast });
    return this;
  }

  public parseString({
    text,
    outputLocation
  }: {
    text: string;
    outputLocation: string;
  }) {
    this._originalFileContent = text;
    this.ast = j.withParser("tsx")(text);
    if (!this.pipelineStore[outputLocation])
      this.pipelineStore[outputLocation] = {
        variableNames: [],
        collectedVariableNames: false
      };
    this.fileLocation = outputLocation;
    this.asts.push({ location: outputLocation, ast: this.ast });
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
      console.error($lf(213), chalk.bgRed("You don't have any asts loaded."));
      return this;
    }

    this.newDirPaths.forEach((dir, index) => {
      try {
        mkdirSync(dir);
        console.info(this.newDirLogs[index]);
      } catch (error) {
        console.error($lf(222), `${chalk.bgRed("[Error]")}: ${error}`);
      }
    });

    this.newFiles.forEach((newFile, index) => {
      try {
        writeFileSync(newFile.location, newFile.content, "utf-8");
        console.info(this.created[index]);
      } catch (error) {
        console.error($lf(231), `${chalk.bgRed("[Error]")}: ${error}`);
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
        console.error($lf(243), `${chalk.bgRed("[Error]")}: ${error}`);
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
    this._originalFileContent = "";
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
      ...f.exportFinder(j, this.ast!, {})
    });
    this.addLog(`Injected export property: ${stageOptions.name}`);
    return this;
  }

  public injectImport(stageOptions: StageOptions<"import">) {
    if (!this.ast) this.parse();
    s.injectImportStage(j, this.ast!, {
      ...stageOptions,
      col: f.importFinder(j, this.ast!, {})
    });
    if (stageOptions.nodes && stageOptions.nodes.length)
      this.addLog("Inejcted an import by node.");
    else
      this.addLog(
        `Injected${stageOptions.importName ? " default " : " "}import: ${
          stageOptions.importName
        }`
      );
    return this;
  }

  public injectStringTemplate(stageOptions: StageOptions<"stringTemplate">) {
    if (!this.ast) this.parse();
    stageOptions.col = f.programFinder(j, this.ast!, {}).col;
    s.injectStringTemplateStage(j, this.ast!, stageOptions);
    this.addLog(`Injected string template code`);
    return this;
  }
  public injectFunctionBody(
    stageOptions: StageOptions<"functionBody">,
    finderOptions: FinderOptions<"function">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.functionFinder(j, this.ast!, finderOptions).col;
    s.injectFunctionBodyStage(j, this.ast!, stageOptions);
    return this;
  }
  public injectReturnObjectProperty(
    stageOptions: StageOptions<"returnObjectProperty">,
    finderOptions: FinderOptions<"function">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.functionFinder(j, this.ast!, finderOptions).col;
    s.injectReturnObjectPropertyStage(j, this.ast!, stageOptions);
    return this;
  }
  public injectImportsFromFile(
    stageOptions: StageOptions<"importsFromFile">,
    finderOptions: FinderOptions<"import">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.importFinder(j, this.ast!, finderOptions);
    s.injectImportsFromFileStage(j, this.ast!, stageOptions);
    return this;
  }
  public injectReturnAllFunctionVariables(
    stageOptions: StageOptions<"returnAllFunctionVariables">,
    finderOptions: FinderOptions<"function">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.functionFinder(j, this.ast!, finderOptions).col;
    s.injectReturnAllFunctionVariablesStage(j, this.ast!, stageOptions);
    return this;
  }
  public injectFunctionParams(
    stageOptions: StageOptions<"functionParams">,
    finderOptions: FinderOptions<"function">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.functionFinder(j, this.ast!, finderOptions).col;
    s.injectFunctionParamsStage(j, this.ast!, stageOptions);
    return this;
  }
  public injectObjectForAccessors(
    stageOptions: StageOptions<"objectForAccessors">
  ) {
    if (!this.ast) this.parse();
    stageOptions.col = f.programFinder(j, this.ast!, {}).col;
    stageOptions.ip = this;
    s.injectObjectForAccessorsStage(j, this.ast!, stageOptions);
    return this;
  }
}

export default InjectionPipeline;

function $lf(n: number) {
  return "$lf|src/pipeline/Injection.pipeline.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
