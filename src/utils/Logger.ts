import chalk from "chalk";

export function Logger(input: any[], source = "Logger") {
  if (input[0] === "warn") {
    console.warn(chalk.yellow(source + ": ", ...input.slice(1)));
  } else if (input[0] === "error") {
    console.error(chalk.redBright(source + ": ", ...input.slice(1)));
    process.exit(1);
  } else {
    console.log(source + ": ", ...input);
  }
}
export function DebugLogger(source: string) {
  return (...args: any[]) => Logger(args, source + "/");
}

export default Logger;
