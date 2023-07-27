import { Collection, JSCodeshift } from "jscodeshift";
import { readFileSync, writeFileSync } from "fs";
import * as prettier from "prettier";
import chalk from "chalk";

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
}
