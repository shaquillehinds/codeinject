//$lf-ignore
/**
 * DO NOT DELETE
 * Experiment file - test various implementations here
 *
 * COMMAND TO RUN
 * yarn experiment
 */

import jcs from "jscodeshift";
import IP from "./index";
import { ExpressionKind } from "ast-types/gen/kinds";
import addObjectForAccessors from "./utils/addObjectForAccessors";
import objParamToIdentifier from "./utils/objParamToIdentifier";

const sources = [
  "tests/experimentTemplates/test.react.template.tsx",
  "tests/experimentTemplates/react.templateA.tsx"
];
const source = sources[1];

async function testingFunction() {
  const p = new IP(source).parse();

  const expDefFinder = IP.getFinder("exportDefaultFinder");

  const blankTemplateState = `export default function BlankTemplateState(){}`;
  const blankTemplateCallbacks = `export default function BlankTemplateCallbacks(){}`;
  const blankTemplateEffects = `export default function BlankTemplateEffects(){}`;
  if (!p._ast) console.log("Ast not loaded, file not found");
  else {
    const found = expDefFinder(jcs, p._ast, {});
    const exportName = IP.getName(found.col);

    if (exportName) {
      const funcFinder = IP.getFinder("functionFinder");
      const funcCol = funcFinder(jcs, p._ast!, { name: exportName }).col;
      const nodes = IP.getBodyNodes(funcCol);
      const paramsAliases: jcs.TSTypeAliasDeclaration[] = [];
      const propertyNames: Record<string, string> = {};
      const params = IP.getFunctionParams(funcCol).map((p, i) => {
        const paramName = `props${i ? i : ""}`;
        const paramTypeName = `BlankTemplateProps${i ? i : ""}`;
        const transformed = objParamToIdentifier({
          param: p,
          paramName,
          paramTypeName
        });
        transformed.propertyNames?.forEach(n => {
          propertyNames[n] = paramName;
        });
        transformed.typeAlias && paramsAliases.push(transformed.typeAlias);
        return transformed.param;
      });

      p.finish();

      if (nodes) {
        const grouped = IP.nodeGrouper({
          nodes,
          groups: [
            "VariableDeclaration",
            "ExpressionStatement",
            "FunctionDeclaration",
            "IfStatement",
            "TryStatement"
          ],
          variableTypes: ["FunctionExpression", "ArrowFunctionExpression"],
          customVariableValidatorType: "CallExpression",
          customVariableValidator: (init: ExpressionKind) => {
            if (init.type === "CallExpression") {
              if (init.callee.type === "Identifier") {
                if (init.callee.name === "useCallback") return true;
              }
            }
            return false;
          }
        });
        const stateNodes = [
          ...grouped.VariableDeclaration
        ] as jcs.VariableDeclaration[];
        const effectNodes = [...grouped.ExpressionStatement];
        const callbackNodes = [
          ...grouped.FunctionDeclaration,
          ...grouped.ArrowFunctionExpression,
          ...grouped.FunctionExpression
        ] as (jcs.FunctionDeclaration | jcs.VariableDeclaration)[];
        const controllerNodes = [
          ...grouped.IfStatement,
          ...grouped.TryStatement
        ];
        await new IP("")
          .parseString({
            text: blankTemplateState,
            outputLocation: "local/state.tsx"
          })
          .injectFunctionBody(
            { nodes: stateNodes },
            { name: "BlankTemplateState" }
          )
          .injectFunctionParams(
            { nodes: params },
            { name: "BlankTemplateState" }
          )
          .injectImportsFromFile({ origin: { source, type: "source" } }, {})
          .injectReturnAllFunctionVariables({}, { name: "BlankTemplateState" })
          .injectStringTemplate({
            position: "lastLine",
            template: `export type BlankTemplateStateReturn = ReturnType <typeof BlankTemplateState>`
          })
          .storeFileVariables()
          .parseString({
            text: blankTemplateCallbacks,
            outputLocation: "local/callbacks.tsx"
          })
          .injectFunctionBody(
            { nodes: callbackNodes },
            { name: "BlankTemplateCallbacks" }
          )
          .injectImportsFromFile({ origin: { source, type: "source" } }, {})
          .injectReturnAllFunctionVariables(
            {},
            { name: "BlankTemplateCallbacks" }
          )
          .injectStringTemplate({
            position: "lastLine",
            template: `export type BlankTemplateCallbacksReturn = ReturnType <typeof BlankTemplateCallbacks>`
          })
          .injectFunctionParams(
            { stringTemplate: "state: BlankTemplateStateReturn" },
            { name: "BlankTemplateCallbacks" }
          )
          .injectImport({
            importName: "BlankTemplateStateReturn",
            source: "./state.tsx"
          })
          .injectObjectForAccessors({
            objectName: "state",
            accessors: ip => {
              return ip.pipelineStore["local/state.tsx"].variableNames;
            }
          })
          .storeFileVariables()
          .parseString({
            text: blankTemplateEffects,
            outputLocation: "local/effects.tsx"
          })
          .injectFunctionBody(
            { nodes: effectNodes },
            { name: "BlankTemplateEffects" }
          )
          .injectImportsFromFile({ origin: { source, type: "source" } }, {})
          .injectFunctionParams(
            {
              stringTemplate:
                "state: BlankTemplateStateReturn, callbacks: BlankTemplateCallbacksReturn"
            },
            { name: "BlankTemplateEffects" }
          )
          .injectImport({
            importName: "BlankTemplateStateReturn",
            source: "./state.tsx"
          })
          .injectImport({
            importName: "BlankTemplateCallbacksReturn",
            source: "./callbacks.tsx"
          })
          .customInject(cp => {
            addObjectForAccessors({
              collection: cp._ast!,
              objectName: "state",
              accessors: cp.pipelineStore["local/state.tsx"].variableNames
            });
            addObjectForAccessors({
              collection: cp._ast!,
              objectName: "callbacks",
              accessors: cp.pipelineStore["local/callbacks.tsx"].variableNames
            });
          })
          .finish();
      }
    }
  }
}
testingFunction();
