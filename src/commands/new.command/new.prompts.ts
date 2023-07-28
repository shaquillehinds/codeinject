import inquirer from "inquirer";
import { typeAliasOptsToStr } from "./new.utilities";

const type = async () =>
  (
    await inquirer.prompt({
      name: "newType",
      type: "list",
      message: "What would you like to create?",
      choices: ["stage", "finder"],
    })
  ).newType;

const name = async () =>
  (
    await inquirer.prompt({
      name: "name",
      type: "input",
      message: "Name of you finder or stage",
    })
  ).name;

const collection = async () =>
  (
    await inquirer.prompt({
      name: "col",
      type: "input",
      message: "Name of collection you will be using?",
    })
  ).col;

const finder = async () =>
  (
    await inquirer.prompt({
      name: "finder",
      type: "input",
      message: "Name of finder this stage will be using?",
    })
  ).finder;

const options = async (name: string) => {
  let newOption: YesOrNo = "Yes";
  const options: [string, string][] = [];
  while (newOption === "Yes") {
    newOption = (
      await inquirer.prompt({
        name: "choice",
        choices: ["Yes", "No"],
        type: "list",
        message: `Add a ${name} option`,
      })
    ).choice as YesOrNo;
    if (newOption === "Yes") {
      const key = (
        await inquirer.prompt({
          name: "key",
          type: "input",
          message: "Key name for this option?",
        })
      ).key;
      const valueType = (
        await inquirer.prompt({
          name: "valueType",
          type: "input",
          message: "Value type for this option?",
        })
      ).valueType;
      if (!key || !valueType) continue;
      options.push([key, valueType]);
    }
  }
  return typeAliasOptsToStr(options);
};

const newCommandPrompts = { type, name, collection, finder, options };

export default newCommandPrompts;
