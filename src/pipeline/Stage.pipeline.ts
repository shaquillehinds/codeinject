import { Collection, JSCodeshift } from "jscodeshift";
import { readFileSync, writeFileSync } from "fs";
import * as prettier from "prettier";

export default class StagePipeline {
  protected currentStage?: Collection;
  constructor(
    protected j: JSCodeshift,
    protected fileLocation: string
  ) {
    return this;
  }

  start() {
    if (this.currentStage) {
      console.error(
        "Session in use. Call finish() before starting another pipeline session."
      );
      return this;
    }

    const file = readFileSync(this.fileLocation, "utf-8");
    this.currentStage = this.j.withParser("tsx")(file);
    return this;
  }

  stage<T extends StageType, F extends FinderType = FinderType>({
    finder,
    stage,
    options,
  }: {
    stage: Stage<T>;
    options: StageOptions<T> & { col?: Collection };
    finder: StageFinder<F>;
  }) {
    if (!this.currentStage) this.start();
    options.col = finder.func(this.j, this.currentStage!, finder.options);
    stage(this.j, this.currentStage!, options);
    return this;
  }

  async finish() {
    if (!this.currentStage)
      return console.error(
        "No current stage, are you sure a stage has been completed?"
      );
    let updatedSource = this.currentStage.toSource();
    try {
      updatedSource = await prettier.format(updatedSource, {
        parser: "typescript",
      });
    } catch (error) {
      console.info(error);
    }
    delete this.currentStage;
    writeFileSync(this.fileLocation, updatedSource, "utf-8");
    return updatedSource;
  }
}
