import { Command } from "commander";

export default function findByIdCommand(program: Command) {
  program
    .command("id <id>")
    .alias("i")
    .description("Find customer by id")
    .action(async (id) => {
      console.info(id);
      process.exit(0);
    });
}
