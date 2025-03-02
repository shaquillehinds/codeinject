import { ExpressionKind, NodeKind } from "ast-types/gen/kinds";
import { VariableDeclaration, Node, ASTNode } from "jscodeshift";

export type NodeGrouperType = NodeKind["type"];
export type VariableType = ExpressionKind["type"];

export type NodeGrouperProps<
  T extends NodeGrouperType,
  V extends VariableType,
  C extends VariableType
> = {
  nodes: ASTNode[];
  groups: T[];
  variableTypes?: V[];
  customVariableValidator?: (init: ExpressionKind) => boolean;
  customVariableValidatorType?: C;
};
export default function nodeGrouper<
  T extends NodeGrouperType,
  V extends VariableType,
  C extends VariableType
>(props: NodeGrouperProps<T, V, C>) {
  type RecordKey = V | C | T;

  const recordKeys: RecordKey[] = [
    ...props.groups,
    ...(props.variableTypes || []),
    ...(props.customVariableValidatorType
      ? [props.customVariableValidatorType]
      : [])
  ];

  const groups: Record<RecordKey, ASTNode[]> = recordKeys.reduce(
    (prev, curr) => ({ ...prev, [curr]: [] }),
    {} as Record<RecordKey, ASTNode[]>
  );
  for (const node of props.nodes) {
    if (node.type === "VariableDeclaration") {
      if (props.variableTypes) {
        const declaration = (node as VariableDeclaration).declarations[0];
        if (declaration.type === "VariableDeclarator") {
          const init = declaration.init;
          if (init) {
            const initType = init.type as V;
            if (props.variableTypes.includes(initType)) {
              groups[initType].push(node);
              continue;
            } else if (
              props.customVariableValidator &&
              props.customVariableValidator(init)
            ) {
              groups[props.customVariableValidatorType || initType].push(node);
              continue;
            }
          }
        }
      }
      if (props.groups.includes("VariableDeclaration" as T)) {
        groups["VariableDeclaration" as T].push(node);
      }
      continue;
    }
    for (const type of props.groups) {
      if (node.type === type) {
        groups[type].push(node);
        break;
      }
    }
  }

  return groups;
}
