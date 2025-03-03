import { typeAliasOptsToStr } from "./new.utilities";
import { YesOrNo } from "@src/@types";

const inquirer = import("inquirer").then(i => i.default);
const prompt = import("inquirer").then(i => i.default).then(i => i.prompt);

const type = async () =>
  (
    await (
      await prompt
    )({
      name: "newType",
      type: "list",
      message: "What would you like to create?",
      choices: ["stage", "finder"]
    })
  ).newType;

const name = async () =>
  (
    await (
      await prompt
    )({
      name: "name",
      type: "input",
      message: "Name of you finder or stage"
    })
  ).name;

const collection = async () =>
  (
    await (
      await prompt
    )({
      name: "col",
      type: "input",
      message: "Name of collection you will be using?"
    })
  ).col;

const finder = async () =>
  (
    await (
      await prompt
    )({
      name: "finder",
      type: "input",
      message: "Name of finder this stage will be using?"
    })
  ).finder;

const options = async (name: string) => {
  let newOption: YesOrNo = "Yes";
  const options: [string, string][] = [];
  while (newOption === "Yes") {
    newOption = (
      await (
        await prompt
      )({
        name: "choice",
        choices: ["Yes", "No"],
        type: "list",
        message: `Add a ${name} option`
      })
    ).choice as YesOrNo;
    if (newOption === "Yes") {
      const key = (
        await (
          await prompt
        )({
          name: "key",
          type: "input",
          message: "Key name for this option?"
        })
      ).key;
      const valueType = (
        await (
          await prompt
        )({
          name: "valueType",
          type: "input",
          message: "Value type for this option?"
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
