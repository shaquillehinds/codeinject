import {
  PatternKind,
  TSCallSignatureDeclarationKind,
  TSConstructSignatureDeclarationKind,
  TSIndexSignatureKind,
  TSMethodSignatureKind,
  TSPropertySignatureKind
} from "ast-types/gen/kinds";
import jcs, { TSTypeLiteral } from "jscodeshift";
import filterMap from "./filterMap";

type TidyObjectParamProps = {
  param: PatternKind;
  paramName: string;
  paramTypeName: string;
};
export default function objParamToIdentifier(props: TidyObjectParamProps) {
  let typeLiteral: TSTypeLiteral | undefined = undefined;
  // let propertySignatures: (
  //   | TSCallSignatureDeclarationKind
  //   | TSConstructSignatureDeclarationKind
  //   | TSIndexSignatureKind
  //   | TSMethodSignatureKind
  //   | TSPropertySignatureKind
  // )[] = [];

  if (props.param.type === "Identifier") return { param: props.param };

  const returnProps: {
    typeAlias?: jcs.TSTypeAliasDeclaration;
    propertyNames?: string[];
    param: PatternKind;
  } = { param: props.param };

  if (props.param.type === "ObjectPattern") {
    if (props.param.typeAnnotation) {
      const { typeAnnotation } = props.param.typeAnnotation;
      if (typeAnnotation?.type === "TSTypeLiteral") {
        typeLiteral = typeAnnotation;
        // propertySignatures = typeAnnotation.members;
      }
    }
    returnProps.propertyNames = filterMap(props.param.properties, p => {
      if (p.type === "ObjectProperty" || p.type === "Property") {
        if (p.value.type === "Identifier") return p.value.name;
        if (p.value.type === "AssignmentPattern") {
          if (p.value.left.type === "Identifier") return p.value.left.name;
          if (p.key.type === "Identifier") return p.key.name;
        }
      }
    });
  }

  returnProps.param = jcs.identifier(props.paramName);

  if (typeLiteral) {
    const typeAlias = jcs.tsTypeAliasDeclaration(
      jcs.identifier(props.paramTypeName),
      typeLiteral
    );
    returnProps.typeAlias = typeAlias;
    const tsTypeAnnotation = jcs.tsTypeAnnotation(
      jcs.tsTypeReference(jcs.identifier(props.paramTypeName))
    );
    returnProps.param.typeAnnotation = tsTypeAnnotation;
  }
  return returnProps;
}

function $lf(n: number) {
  return "$lf|src/utils/objParamToIdentifier.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
