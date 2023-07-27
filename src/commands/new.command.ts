import { Command } from "commander";
import { readFileSync, writeFileSync } from "fs";
import inquirer from "inquirer";
import newFinderCommandPipeline from "./pipelines/newFinder.command.pipeline";
import newStageCommandPipeline from "./pipelines/newStage.command.pipeline";

type NewType = "stage" | "finder";

export default function newCommand(program: Command) {
  program
    .command("new [type]")
    .description("Creates a new stage or finder")
    // dash syntax resolves to camel case --first-name=firstName
    .option("-n --name <string>", "Name of stage or finder")
    .option("-c --collection <string>", "Name of stage collection")
    .action(async (type, { name, collection }) => {
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

      if (newType === "finder") {
        await newFinderCommandPipeline(name);
        writeFileSync(
          `src/pipeline/finders/${nameL}.finder.ts`,
          readFileSync(`src/templates/files/finder.template`, "utf-8")
            .replaceAll("{!template}", name)
            .replaceAll("{template}", nameL),
          "utf-8"
        );
      } else if (newType === "stage") {
        let col = collection;
        if (!col)
          col = (
            await inquirer.prompt({
              name: "col",
              type: "input",
              message: "Name of collection this stage will be using.",
            })
          ).col;
        await newStageCommandPipeline(name, col);
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
