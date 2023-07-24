import { Command } from "commander";
import inquirer, { QuestionCollection } from "inquirer";

const questions: QuestionCollection<Customer> = [
  {
    type: "input",
    message: "What is your first name?",
    name: "firstName",
  },
  {
    type: "input",
    message: "What is your last name?",
    name: "lastName",
  },
  {
    type: "input",
    message: "What is your email address?",
    name: "email",
  },
  {
    type: "input",
    message: "What is your phone number?",
    name: "phone",
  },
];

export default function addCommand(program: Command) {
  return program
    .command("add")
    .description("Add a customer")
    .alias("a")
    .action(async () => {
      const customerData = await inquirer.prompt(questions);
      console.info(customerData);
      process.exit(0);
    });
}
