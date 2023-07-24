import { Command } from "commander";

export default function deleteCommand(program: Command) {
  program
    .command("delete <id>")
    .alias("d")
    .description("Delete customer by id")
    .action(async (id) => {
      console.info(id);
      process.exit(0);
    });
}
