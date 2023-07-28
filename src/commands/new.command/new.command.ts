import { Command } from "commander";
import chalk from "chalk";
import { FinderTypeE } from "@src/@types/finder.enums";
import { DebugLogger } from "@utils/Logger";
import newFinderCommandPipeline from "../pipelines/newFinder.command.pipeline";
import newStageCommandPipeline from "../pipelines/newStage.command.pipeline";
import newCommandPrompts from "./new.prompts";
import newInserts from "./new.inserts";
import utilities from "./new.utilities";

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
    .action(async (type, { name: n, collection, finder }) => {
      let newType = type as NewType;

      if (!type) newType = await newCommandPrompts.type();
      if (!n) n = await newCommandPrompts.name();

      const [name, nameL] = utilities.handleName(n);

      if (!collection) collection = await newCommandPrompts.collection();

      if (newType === "finder") {
        const finderOpts = await newCommandPrompts.options("finder");
        await newFinderCommandPipeline(name, finderOpts);
        newInserts.finder(name, nameL, collection);
      } else if (newType === "stage") {
        if (!finder) finder = await newCommandPrompts.finder();

        if (!finder) {
          log("error", "A finder is required to create a new stage");
          process.exit(1);
        }

        const finderL = finder[0].toLowerCase() + finder.slice(1);
        if (finder && !FinderTypeE[finder as FinderType]) {
          console.info(
            chalk.cyanBright(
              "This finder does not exist, so it will be created"
            )
          );

          const finderOpts = await newCommandPrompts.options("finder");
          await newFinderCommandPipeline(finder, finderOpts);

          newInserts.finder(finder, finderL, collection);
        }

        const stageOpts = await newCommandPrompts.options("finder");
        await newStageCommandPipeline(name, finder, stageOpts, collection);

        newInserts.stage(name, nameL, collection);
      }
      process.exit(0);
    });
}
