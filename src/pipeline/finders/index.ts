import switchFinder from "./switch.finder";
import tsEnumFinder from "./tsEnum.finder";
import importFinder from "./import.finder";
import exportFinder from "./export.finder";
import programFinder from "./program.finder";
import classBodyFinder from "./classBody.finder";
import jsxElementFinder from "./jsxElement.finder";
import tsNamespaceFinder from "./tsNamespace.finder";
import tsTypeAliasFinder from "./tsTypeAlias.finder";
import exportDefaultFinder from "./defaultExport.finder";
import tsTypeLiteralFinder from "./tsTypeLiteral.finder";
import arrayVariableFinder from "./variableArray.finder";
import existingImportFinder from "./existingImport.finder";
import objectVariableFinder from "./variableObject.finder";
import tsInterfaceBodyFinder from "./tsInterfaceBody.finder";

const finders = {
  classBodyFinder,
  importFinder,
  exportFinder,
  switchFinder,
  tsEnumFinder,
  programFinder,
  jsxElementFinder,
  tsTypeAliasFinder,
  tsNamespaceFinder,
  exportDefaultFinder,
  tsTypeLiteralFinder,
  arrayVariableFinder,
  existingImportFinder,
  objectVariableFinder,
  tsInterfaceBodyFinder
};
export default finders;
