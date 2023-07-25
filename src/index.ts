#!/usr/bin/env node --experimental-specifier-resolution=node

import chalk from "chalk";
import { program } from "commander";
import * as commands from "./commands";
import { StagePipeline } from "./pipeline";
import jcs from "jscodeshift";
import path from "path";
import * as stages from "./pipeline/stages";
import { objectVariableFinder, switchFinder } from "./pipeline/finders";
import reducerStateReturnStatement from "./templates/statements/reducerState.return.statement";

program.version("1.0.0").description("Client Management System CLI");

// Adding commands to program
for (let command in commands) {
  const commandKey = command as keyof typeof commands;
  commands[commandKey](program);
}

console.info(chalk.cyan(process.cwd()));

await new StagePipeline(
  jcs,
  `${path.join(process.cwd(), "/testFile2.playground.ts")}`
)
  .start()
  .stage<"case">({
    stage: stages.injectSwitchCaseStage,
    options: {
      caseName: "AppActionType.SET_SOMETHING",
      identifier: true,
      statements: [
        reducerStateReturnStatement(jcs, {
          something: "action.payload@jsc.identifier",
        }),
      ],
    },
    finder: {
      func: switchFinder,
      options: { name: "action.type", type: "switch" },
    },
  })
  .stage<"property">({
    stage: stages.injectPropertyStage,
    options: {
      key: "something",
      value: 26,
      identifier: false,
    },
    finder: {
      func: objectVariableFinder,
      options: {
        type: "variableObject",
        name: "initialState",
      },
    },
  })
  // .stage<"import">({
  //   stage: injectImportStage,
  //   options: {
  //     source: "./test.reducer",
  //     isDefault: true,
  //     importName: "testReducer",
  //   },
  // })
  .finish();

program.parse(process.argv);
