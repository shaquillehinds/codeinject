import { BlockStatement, JSCodeshift, ObjectMethod } from "jscodeshift";

export default function funcToExp(jcs: JSCodeshift, func: FunctionConstructor) {
  let str: string = func.toString();
  try {
    const ast = jcs.withParser("tsx")(str);
    const exp = ast.find(jcs.ArrowFunctionExpression).nodes()[0];
    if (!exp) {
      const funcDec = ast.find(jcs.FunctionDeclaration).nodes()[0];
      if (funcDec)
        return jcs.functionExpression(funcDec.id, funcDec.params, funcDec.body);
      else {
        const { value: v } = ast.find(jcs.MethodDefinition).nodes()[0];
        return jcs.functionExpression(v.id, v.params, v.body as BlockStatement);
      }
    }
    return exp;
  } catch (error) {
    str = `const obj = {${str}}`;
    const ast = jcs.withParser("tsx")(str);
    let method = ast.find(jcs.ObjectExpression).nodes()[0]
      .properties[0] as ObjectMethod;
    return method;
  }
}
