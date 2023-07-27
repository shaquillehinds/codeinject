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
    .action(async (type, { name }) => {
      let newType = type as NewType;
      let newName = name;
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
      if (!newName) {
        newName = (
          await inquirer.prompt({
            name: "newName",
            type: "input",
            message: "Name of you finder or stage",
          })
        ).newName;
      }
      const nameL = newName[0].toLowerCase() + newName.slice(1);

      if (newType === "finder") {
        await newFinderCommandPipeline(newName);
        writeFileSync(
          `src/pipeline/finders/${nameL}.finder.ts`,
          readFileSync(`src/templates/files/finder.template`, "utf-8")
            .replaceAll("{!template}", newName)
            .replaceAll("{template}", nameL),
          "utf-8"
        );
      } else if (newType === "stage") {
        await newStageCommandPipeline(newName);
        writeFileSync(
          `src/pipeline/stages/${nameL}.inject.stage.ts`,
          readFileSync(`src/templates/files/stage.template`, "utf-8")
            .replaceAll("{!template}", newName)
            .replaceAll("{template}", nameL),
          "utf-8"
        );
      }
      process.exit(0);
    });
}
