import anyToExp from "./anyToExp.parser";
import arrToExp from "./arrToExp.parser";
import funcToExp from "./funcToExp.parser";
import objToExp from "./objToExp.parser";
import stringToASTType from "./stringToASTType.parser";

const parsers = {
  anyToExp,
  arrToExp,
  funcToExp,
  objToExp,
  stringToASTType,
};

export default parsers;
