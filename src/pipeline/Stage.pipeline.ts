import { Collection, JSCodeshift } from "jscodeshift";
import { readFileSync, writeFileSync } from "fs";

export default class StagePipeline {
  protected currentStage?: Collection;
  constructor(protected j: JSCodeshift, protected fileLocation: string) {
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
    options: StageOptions<T>;
    finder?: { func: Finder; options: FinderOptions<F> };
  }) {
    if (!this.currentStage) this.start();
    if (finder) {
      options.col = finder.func(this.j, this.currentStage!, finder.options);
    }
    stage(this.j, this.currentStage!, options);
    return this;
  }

  finish() {
    if (!this.currentStage)
      return console.error(
        "No current stage, are you sure a stage has been completed?"
      );
    const updatedSource = this.currentStage?.toSource();
    delete this.currentStage;
    writeFileSync(this.fileLocation, updatedSource, "utf-8");
    return updatedSource;
  }
}
