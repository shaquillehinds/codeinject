#!/usr/bin/env node --experimental-specifier-resolution=node

import chalk from "chalk";
import { program } from "commander";
import * as commands from "./commands";
import { StagePipeline } from "./pipeline";
import jcs from "jscodeshift";
import path from "path";
import * as stages from "./pipeline/stages";
import * as finders from "./pipeline/finders";
import reducerStateReturnStatement from "./templates/statements/reducerState.return.statement";

program.version("1.0.0").description("Client Management System CLI");

// Adding commands to program
for (let command in commands) {
  const commandKey = command as keyof typeof commands;
  commands[commandKey](program);
}

console.info(chalk.cyan(process.cwd()));

const myTemplate = (prop: string) => `{
  roles: {
    main: ${prop};
    players: Player[];
  }
}`;

await new StagePipeline(
  jcs,
  `${path.join(process.cwd(), "/testFile4.playground.ts")}`
)
  .start()
  // .stage<"stringTemplate">({
  //   stage: stages.injectStringTemplateStage,
  //   options: {
  //     position: "afterImport",
  //     template: `
  //     interface SetSomething {
  //       type: AppActionType.Set_Something;
  //       payload: string;
  //     }
  //   `,
  //   },
  //   finder: {
  //     func: finders.programFinder,
  //     options: { type: "program" },
  //   },
  // })
  // .stage<"tsInterfaceBody">({
  //   stage: stages.injectTSInterfaceBodyStage,
  //   finder: {
  //     func: finders.tsInterfaceBodyFinder,
  //     options: { name: "SetAppStatus", type: "tsInterfaceBody" },
  //   },
  //   options: {
  //     bodyStringTemplate: myTemplate('"custom"'),
  //   },
  // })
  // .stage<"tsEnumMember">({
  //   stage: stages.injectTSEnumStage,
  //   options: { key: "SET_SOMETHING", value: "SET_SOMETHING" },
  //   finder: {
  //     func: finders.tsEnumMemberFinder,
  //     options: { name: "AppActionType", type: "tsEnumMember" },
  //   },
  // })
  // .stage<"case">({
  //   stage: stages.injectSwitchCaseStage,
  //   options: {
  //     caseName: "AppActionType.SET_SOMETHING",
  //     identifier: true,
  //     statements: [
  //       reducerStateReturnStatement(jcs, {
  //         something: "action.payload@jsc.identifier",
  //       }),
  //     ],
  //   },
  //   finder: {
  //     func: switchFinder,
  //     options: { name: "action.type", type: "switch" },
  //   },
  // })
  // .stage<"property">({
  //   stage: stages.injectPropertyStage,
  //   options: {
  //     key: "something",
  //     value: 26,
  //     identifier: false,
  //   },
  //   finder: {
  //     func: objectVariableFinder,
  //     options: {
  //       type: "variableObject",
  //       name: "initialState",
  //     },
  //   },
  // })
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
