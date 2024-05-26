import switchFinder from "./switch.finder";
import tsEnumFinder from "./tsEnum.finder";
import importFinder from "./import.finder";
import exportFinder from "./export.finder";
import programFinder from "./program.finder";
import tsTypeAliasFinder from "./tsTypeAlias.finder";
import tsTypeLiteralFinder from "./tsTypeLiteral.finder";
import exportDefaultFinder from "./defaultExport.finder";
import arrayVariableFinder from "./variableArray.finder";
import objectVariableFinder from "./variableObject.finder";
import classBodyFinder from "./classBody.finder";
import tsInterfaceBodyFinder from "./tsInterfaceBody.finder";
import jsxElementFinder from "./jsxElement.finder";

const finders = {
  classBodyFinder,
  importFinder,
  exportFinder,
  switchFinder,
  tsEnumFinder,
  programFinder,
  tsTypeAliasFinder,
  exportDefaultFinder,
  tsTypeLiteralFinder,
  arrayVariableFinder,
  objectVariableFinder,
  tsInterfaceBodyFinder,
  jsxElementFinder
};
export default finders;
