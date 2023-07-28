import { Command } from "commander";
import { readFileSync, writeFileSync } from "fs";
import inquirer from "inquirer";
import newFinderCommandPipeline from "./pipelines/newFinder.command.pipeline";
import newStageCommandPipeline from "./pipelines/newStage.command.pipeline";
import chalk from "chalk";
import { FinderTypeE } from "@src/@types/finder.enums";

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
    .action(async (type, { name, collection, finder }) => {
      let newType = type as NewType;
      if (!type) {
        newType = (
          await inquirer.prompt({
            name: "newType",
            type: "list",
            message: "What would you like to create?",
            choices: ["stage", "finder"],
          })
        ).newType;
      }
      if (!name) {
        name = (
          await inquirer.prompt({
            name: "name",
            type: "input",
            message: "Name of you finder or stage",
          })
        ).name;
      }
      const nameL = name[0].toLowerCase() + name.slice(1);
      name = name[0].toUpperCase() + name.slice(1);

      if (!collection)
        collection = (
          await inquirer.prompt({
            name: "col",
            type: "input",
            message: "Name of collection you will be using?",
          })
        ).col;

      if (newType === "finder") {
        await newFinderCommandPipeline(name);
        writeFileSync(
          `src/pipeline/finders/${nameL}.finder.ts`,
          readFileSync(`src/templates/files/finder.template`, "utf-8")
            .replaceAll("{!template}", name)
            .replaceAll("{template}", nameL)
            .replaceAll("{collection}", collection),
          "utf-8"
        );
      } else if (newType === "stage") {
        if (!finder)
          finder = (
            await inquirer.prompt({
              name: "finder",
              type: "input",
              message: "Name of finder this stage will be using?",
            })
          ).finder;
        if (finder && !FinderTypeE[finder as FinderType]) {
          console.info(
            chalk.cyanBright(
              "This finder does not exist, so it will be created"
            )
          );
          await newFinderCommandPipeline(finder);
          const finderL = finder[0].toLowerCase() + finder.slice(1);
          writeFileSync(
            `src/pipeline/finders/${finderL}.finder.ts`,
            readFileSync(`src/templates/files/finder.template`, "utf-8")
              .replaceAll("{!template}", finder)
              .replaceAll("{template}", finderL),
            "utf-8"
          );
        }

        await newStageCommandPipeline(name, collection);
        writeFileSync(
          `src/pipeline/stages/${nameL}.inject.stage.ts`,
          readFileSync(`src/templates/files/stage.template`, "utf-8")
            .replaceAll("{!template}", name)
            .replaceAll("{template}", nameL),
          "utf-8"
        );
      }
      process.exit(0);
    });
}
