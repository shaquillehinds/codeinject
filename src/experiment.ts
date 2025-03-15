/**
 * DO NOT DELETE
 * Experiment file - test various implementations here
 *
 * COMMAND TO RUN
 * yarn experiment
 */

import jcs, { ReturnStatement } from "jscodeshift";
import { InjectionPipeline as IP } from "./index";
import { ExpressionKind } from "ast-types/gen/kinds";

const sources = [
  "tests/experimentTemplates/test.react.template.tsx",
  "tests/experimentTemplates/react.templateA.tsx",
  "tests/experimentTemplates/react.templateB.tsx",
];
const source = sources[2];

async function testingFunction() {
  const p = new IP(source).parse();

  const expDefFinder = IP.getFinder("exportDefaultFinder");

  const blankTemplateState = `export default function BlankTemplateState(){}`;
  const blankTemplateCallbacks = `export default function BlankTemplateCallbacks(){}`;
  const blankTemplateEffects = `export default function BlankTemplateEffects(){}`;
  const blankTemplateController = `export default function BlankTemplateController(){}`;
  const blankTemplate = `export default function BlankTemplate(){}`;

  if (!p._ast) console.log($lf(31), "Ast not loaded, file not found");
  else {
    const found = expDefFinder(jcs, p._ast, {});
    const exportName = IP.getName(found.col);

    if (exportName) {
      const funcFinder = IP.getFinder("functionFinder");
      const funcCol = funcFinder(jcs, p._ast!, { name: exportName }).col;
      const nodes = IP.getBodyNodes(funcCol);
      const paramsAliases: jcs.TSTypeAliasDeclaration[] = [];
      const propertyNames: Record<string, string[]> = {};
      const params = IP.getFunctionParams(funcCol).map((p, i) => {
        const paramName = `props${i ? i : ""}`;
        const paramTypeName = `BlankTemplateProps${i ? i : ""}`;
        const transformed = IP.objParamToIdentifier({
          param: p,
          paramName,
          paramTypeName,
        });
        propertyNames[paramName] = [];
        // console.log($lf(51), transformed);
        transformed.propertyNames?.forEach((n) => {
          propertyNames[paramName].push(n);
        });
        transformed.typeAlias &&
          paramsAliases.push(
            //@ts-ignore
            jcs.exportNamedDeclaration(transformed.typeAlias),
          );
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
            "TryStatement",
            "ReturnStatement",
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
          },
        });
        const stateNodes = [
          ...grouped.VariableDeclaration,
        ] as jcs.VariableDeclaration[];
        const effectNodes = [...grouped.ExpressionStatement];
        const callbackNodes = [
          ...grouped.FunctionDeclaration,
          ...grouped.ArrowFunctionExpression,
          ...grouped.FunctionExpression,
          ...grouped.CallExpression,
        ] as (jcs.FunctionDeclaration | jcs.VariableDeclaration)[];
        const controllerNodes = [
          ...grouped.IfStatement,
          ...grouped.TryStatement,
        ];
        const ip = new IP("");
        const statePipeline = await ip
          .parseString({
            text: blankTemplateState,
            outputLocation: "local/state.tsx",
          })
          .injectFunctionBody(
            { nodes: stateNodes },
            { name: "BlankTemplateState" },
          )
          .injectFunctionParams(
            { nodes: params },
            { name: "BlankTemplateState" },
          )
          .injectToProgram(
            {
              nodes: paramsAliases,
              injectionPosition: "afterImport",
            },
            {},
          )
          .customInject((ip) => {
            for (const property of Object.keys(propertyNames)) {
              ip.injectObjectForAccessors({
                accessors: propertyNames[property],
                objectName: property,
              });
            }
          })
          .injectImportsFromFile({ origin: { source, type: "source" } }, {})
          .injectReturnAllFunctionVariables({}, { name: "BlankTemplateState" })
          .injectStringTemplate({
            position: "lastLine",
            template: `export type BlankTemplateStateReturn = ReturnType <typeof BlankTemplateState>`,
          })
          .storeFileVariables()
          .finish();

        const callbacksPipeline = await ip
          .parseString({
            text: blankTemplateCallbacks,
            outputLocation: "local/callbacks.tsx",
          })
          .injectFunctionBody(
            { nodes: callbackNodes },
            { name: "BlankTemplateCallbacks" },
          )
          .injectImportsFromFile({ origin: { source, type: "source" } }, {})
          .injectReturnAllFunctionVariables(
            {},
            { name: "BlankTemplateCallbacks" },
          )
          .injectStringTemplate({
            position: "lastLine",
            template: `export type BlankTemplateCallbacksReturn = ReturnType <typeof BlankTemplateCallbacks>`,
          })
          .injectFunctionParams(
            { stringTemplate: "state: BlankTemplateStateReturn" },
            { name: "BlankTemplateCallbacks" },
          )
          .injectFunctionParams(
            { nodes: params },
            { name: "BlankTemplateCallbacks" },
          )
          .customInject((ip) => {
            for (const property of Object.keys(propertyNames)) {
              ip.injectObjectForAccessors({
                accessors: propertyNames[property],
                objectName: property,
              });
            }
          })
          .injectImport({
            importName: "BlankTemplateStateReturn",
            source: "./state.tsx",
          })
          .injectImport({
            importName: "BlankTemplateProps",
            source: "./state.tsx",
          })
          .injectObjectForAccessors({
            objectName: "state",
            accessors: (ip) => {
              return ip.pipelineStore["local/state.tsx"].variableNames;
            },
          })
          .storeFileVariables()
          .finish();
        const effectsPipeline = await ip
          .parseString({
            text: blankTemplateEffects,
            outputLocation: "local/effects.tsx",
          })
          .injectFunctionBody(
            { nodes: effectNodes },
            { name: "BlankTemplateEffects" },
          )
          .injectImportsFromFile({ origin: { source, type: "source" } }, {})
          .injectFunctionParams(
            {
              stringTemplate:
                "state: BlankTemplateStateReturn, callbacks: BlankTemplateCallbacksReturn",
            },
            { name: "BlankTemplateEffects" },
          )
          .injectFunctionParams(
            { nodes: params },
            { name: "BlankTemplateEffects" },
          )
          .injectImport({
            importName: "BlankTemplateProps",
            source: "./state.tsx",
          })
          .injectImport({
            importName: "BlankTemplateStateReturn",
            source: "./state.tsx",
          })
          .injectImport({
            importName: "BlankTemplateCallbacksReturn",
            source: "./callbacks.tsx",
          })
          .customInject((cp) => {
            cp.injectObjectForAccessors({
              objectName: "state",
              accessors: cp.pipelineStore["local/state.tsx"].variableNames,
            });
            cp.injectObjectForAccessors({
              objectName: "callbacks",
              accessors: cp.pipelineStore["local/callbacks.tsx"].variableNames,
            });
            for (const property of Object.keys(propertyNames)) {
              cp.injectObjectForAccessors({
                accessors: propertyNames[property],
                objectName: property,
              });
            }
          })
          .finish();
        const controllerPipeline = await ip
          .parseString({
            text: blankTemplateController,
            outputLocation: "local/controller.tsx",
          })
          .injectFunctionBody(
            {
              stringTemplate: ` const state = BlankTemplateState(props);
  const callbacks = BlankTemplateCallbacks(state, props)
  BlankTemplateEffects(state, callbacks, props)`,
            },
            { name: "BlankTemplateController" },
          )
          .injectFunctionBody(
            { nodes: controllerNodes },
            { name: "BlankTemplateController" },
          )
          .injectImportsFromFile({ origin: { source, type: "source" } }, {})
          .injectFunctionParams(
            { nodes: params },
            { name: "BlankTemplateController" },
          )
          .injectImport({
            importName: "BlankTemplateProps",
            source: "./state.tsx",
          })
          .injectImport({
            importName: "BlankTemplateState",
            source: "./state.tsx",
          })
          .injectImport({
            importName: "BlankTemplateCallbacks",
            source: "./callbacks.tsx",
          })
          .injectImport({
            importName: "BlankTemplateEffects",
            source: "./effects.tsx",
          })
          .injectFunctionBody(
            {
              stringTemplate: `return { state, callbacks }`,
            },
            { name: "BlankTemplateController" },
          )
          .commit((cp) => {
            cp.injectObjectForAccessors({
              objectName: "state",
              accessors: cp.pipelineStore["local/state.tsx"].variableNames,
            });
            cp.injectObjectForAccessors({
              objectName: "callbacks",
              accessors: cp.pipelineStore["local/callbacks.tsx"].variableNames,
            });
            for (const property of Object.keys(propertyNames)) {
              cp.injectObjectForAccessors({
                accessors: propertyNames[property],
                objectName: property,
              });
            }
            cp.finish();
          });

        const indexPipeline = ip
          .parseString({
            outputLocation: "local/index.tsx",
            text: blankTemplate,
          })
          .injectFunctionBody(
            {
              stringTemplate: `
const { state, callbacks } = BlankTemplateController(props);
`,
            },
            { name: "BlankTemplate" },
          )
          .injectFunctionParams({ nodes: params }, { name: "BlankTemplate" })
          .injectImport({
            importName: "BlankTemplateProps",
            source: "./state.tsx",
          })
          .injectImport({
            importName: "BlankTemplateController",
            source: "./controller.tsx",
          })
          .injectReturnStatement(
            { node: grouped.ReturnStatement[0] as ReturnStatement },
            { name: "BlankTemplate" },
          )
          .injectImportsFromFile({ origin: { source, type: "source" } }, {})
          .commit((cp) => {
            cp.injectObjectForAccessors({
              objectName: "state",
              accessors: cp.pipelineStore["local/state.tsx"].variableNames,
            });
            cp.injectObjectForAccessors({
              objectName: "callbacks",
              accessors: cp.pipelineStore["local/callbacks.tsx"].variableNames,
            });
            for (const property of Object.keys(propertyNames)) {
              cp.injectObjectForAccessors({
                accessors: propertyNames[property],
                objectName: property,
              });
            }
            cp.finish();
          });
      }
    }
  }
}
testingFunction();

function $lf(n: number) {
  return "$lf|codeinject/src/experiment.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
