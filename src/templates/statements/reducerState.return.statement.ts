import { JSCodeshift } from "jscodeshift";
import objToExp from "../../pipeline/parsers/objToExp.parser";
import jcs from "jscodeshift";

function reducerStateReturnStatement(payload: { [key: string]: any }) {
  const value = objToExp(jcs, payload);
  const objExp = jcs.objectExpression([
    jcs.spreadElement(jcs.identifier("state")),
  ]);
  for (let prop in value.properties)
    objExp.properties.push(value.properties[prop]);
  return jcs.returnStatement(objExp);
}

export default reducerStateReturnStatement;
