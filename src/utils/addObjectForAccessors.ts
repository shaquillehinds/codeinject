import jcs, { ASTNode, Node } from "jscodeshift";

type AddAccessorsToObjectProps = {
  objectName: string;
  accessors: string[];
  collection: jcs.Collection;
};
export default function addObjectForAccessors(
  props: AddAccessorsToObjectProps
) {
  const { objectName, accessors, collection } = props;
  accessors.forEach((name: string) => {
    const importNames: Record<string, string> = {};
    collection.find(jcs.Identifier, { name }).map(identifier => {
      if (importNames[name]) return identifier;
      const parentValue = identifier.parentPath.value;
      if (jcs.Node.check(parentValue)) {
        if (jcs.ImportSpecifier.check(parentValue)) {
          importNames[name] = name;
          return identifier;
        }
        if (jcs.VariableDeclarator.check(parentValue)) return identifier;
        if (jcs.ObjectProperty.check(parentValue)) {
          const objKey =
            parentValue.key.type === "Identifier" ? parentValue.key.name : "";
          const objVal =
            parentValue.value.type === "Identifier"
              ? parentValue.value.name
              : "";
          if (objKey === objVal)
            identifier.value.name = `${name}: ${objectName}.${name}`;
          else if (parentValue.value.type === "Identifier")
            parentValue.value.name = `${objectName}.${name}`;
        } else if (
          jcs.TSPropertySignature.check(parentValue) ||
          jcs.JSXAttribute.check(parentValue)
        ) {
          return identifier;
        } else {
          identifier.value.name = `${objectName}.${name}`;
        }
      } else identifier.value.name = `${objectName}.${name}`;
      return identifier;
    });
  });
}
