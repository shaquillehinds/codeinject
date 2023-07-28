import { DebugLogger } from "@utils/Logger";

const log = DebugLogger("new.utilities.ts");

export function handleName(name: string) {
  if (!name) {
    log("error", "A name is required to create the stage/finder.");
    process.exit(1);
  }
  const nameL = name[0].toLowerCase() + name.slice(1);
  name = name[0].toUpperCase() + name.slice(1);

  return [name, nameL];
}

export function typeAliasOptsToStr(opts: [string, string][]) {
  return opts.reduce((prev, curr) => {
    const split = curr[1].split("@jcs.stringLiteral");

    return prev + `\n ${curr[0]}: ${split[1] ? `"${curr[1]}"` : curr[1]};`;
  }, "");
}

const utilities = {
  handleName,
};

export default utilities;
