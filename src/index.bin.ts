#!/usr/bin/env node --experimental-specifier-resolution=node
import { program } from "commander";
import * as commands from "./commands";

program.version("1.0.0").description("tscodeinject dev kit");

// Adding commands to program
for (let command in commands) {
  const commandKey = command as keyof typeof commands;
  commands[commandKey](program);
}

program.parse(process.argv);
