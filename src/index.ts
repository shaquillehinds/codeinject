#!/usr/bin/env node --experimental-specifier-resolution=node

import chalk from "chalk";
import { program } from "commander";
import * as commands from "./commands";
import { StagePipeline } from "./pipeline";
import j from "jscodeshift";
import path from "path";
import { injectImportStage, injectPropertyStage } from "./pipeline/stages";
import { objectVariableFinder } from "./pipeline/finders";

program.version("1.0.0").description("Client Management System CLI");

// Adding commands to program
for (let command in commands) {
  const commandKey = command as keyof typeof commands;
  commands[commandKey](program);
}

console.log(chalk.cyan(process.cwd()));

new StagePipeline(j, `${path.join(process.cwd(), "/testFile.playground.ts")}`)
  .start()
  .stage<"import">({
    stage: injectImportStage,
    options: {
      source: "./test.reducer",
      isDefault: true,
      importName: "testReducer",
      type: "import",
    },
  })
  .stage<"property">({
    stage: injectPropertyStage,
    options: {
      type: "property",
      key: "test",
      value: "testReducer",
      identifier: true,
    },
    finder: {
      func: objectVariableFinder,
      options: {
        type: "variableObject",
        variableName: "reducers",
      },
    },
  })
  .finish();

program.parse(process.argv);
