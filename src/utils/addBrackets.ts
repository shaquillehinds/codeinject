export default function addBrackets(str: string) {
  str = str.trim();
  if (str[0] !== "{") {
    str = `{
  ${str}
}`;
  }
  return str;
}
