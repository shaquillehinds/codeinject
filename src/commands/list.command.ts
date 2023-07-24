import { Command } from "commander";

export default function listCommand(program: Command) {
  program
    .command("list")
    .alias("l")
    .description("List customers")
    .option("-l --limit <number>", "Limit the amount of customers returned")
    .option("-s --skip <number>", "Skip a batch of customers")
    .action(async (opts) => {
      console.info(opts);
      process.exit(0);
    });
}
