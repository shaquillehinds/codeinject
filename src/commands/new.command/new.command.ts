import { Command } from "commander";
import chalk from "chalk";
import { FinderTypeE } from "@src/@types/finder.enums";
import { DebugLogger } from "@utils/Logger";
import newFinderCommandPipeline from "../pipelines/newFinder.command.pipeline";
import newStageCommandPipeline from "../pipelines/newStage.command.pipeline";
import newCommandPrompts from "./new.prompts";
import utilities, { handleName } from "./new.utilities";
import { FinderType } from "@src/@types/finder";

const log = DebugLogger("new.command.ts");

type NewType = "stage" | "finder";

export default function newCommand(program: Command) {
  program
    .command("new [type]")
    .description("Creates a new stage or finder")
    // dash syntax resolves to camel case --first-name=firstName
    .option("-n --name <string>", "Name of stage or finder")
    .option(
      "-f --finder <string>",
      "Name of finder you want to use for the stage"
    )
    .option("-c --collection <string>", "Name of stage collection")
    .action(async (type, { name: n, collection, finder: f }) => {
      let newType = type as NewType;

      if (!type) newType = await newCommandPrompts.type();
      if (!n) n = await newCommandPrompts.name();

      const [name, nameL] = utilities.handleName(n);

      if (!collection) collection = await newCommandPrompts.collection();

      if (newType === "finder") {
        const finderOpts = await newCommandPrompts.options("finder");
        await newFinderCommandPipeline(name, finderOpts, collection);
      } else if (newType === "stage") {
        if (!f) f = await newCommandPrompts.finder();

        if (!f) {
          console.error($lf(43), "A finder is required to create a new stage");
        }

        const [finder, finderL] = handleName(f);
        if (finder && !FinderTypeE[finderL as FinderType]) {
          console.info(
            chalk.cyanBright(
              "This finder does not exist, so it will be created"
            )
          );

          const finderOpts = await newCommandPrompts.options("finder");
          await newFinderCommandPipeline(finder, finderOpts, collection);
        }

        const stageOpts = await newCommandPrompts.options("stage");
        console.log($lf(59), stageOpts);
        await newStageCommandPipeline(name, finderL, stageOpts, collection);
      }
      process.exit(0);
    });
}

function $lf(n: number) {
  return "$lf|commands/new.command/new.command.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
