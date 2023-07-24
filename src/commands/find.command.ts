import { Command } from "commander";

export default function findCommand(program: Command) {
  return program
    .command("find")
    .description("Find a customer")
    .alias("f")
    .option("-t --test", "Testing flag options")
    .argument("<find>")
    .action(async (name, opts, command) => {
      console.log(name, opts, command.name());
      process.exit(0);
    });
}
