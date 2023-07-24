import { Command } from "commander";

export default function updateCommand(program: Command) {
  program
    .command("update <id>")
    .alias("u")
    .description("Update a customer")
    // dash syntax resolves to camel case --first-name=firstName
    .option("-f --first-name <string>", "Update first name")
    .option("-l --last-name <string>", "Update last name")
    .option("-e --email <string>", "Update email address")
    .option("-p --phone <string>", "Update phone number")
    .action(async (id, opts) => {
      console.info({ id, ...opts });
      process.exit(0);
    });
}
