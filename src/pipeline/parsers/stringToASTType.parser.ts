import jcs from "jscodeshift";

export default function stringToASTType(str: string) {
  const split = str.split("@jcs.identifier");
  const type =
    split[1] !== undefined
      ? jcs.identifier(split[0])
      : jcs.stringLiteral(split[0]);
  return {
    string: split[0],
    type,
  };
}
