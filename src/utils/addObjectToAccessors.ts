import jcs from "jscodeshift";

type AddAccessorsToObjectProps = {
  objectName: string;
  accessors: string[];
  collection: jcs.Collection;
};
export default function addObjectToAccessors(props: AddAccessorsToObjectProps) {
  const { objectName, accessors, collection } = props;
  accessors.forEach((name: string) => {
    collection.find(jcs.Identifier, { name }).map(identifier => {
      const parentValue = identifier.parentPath.value;
      console.log($lf(13), identifier.value);
      if (jcs.Node.check(parentValue)) {
        if (jcs.ObjectProperty.check(parentValue)) {
          const objKey =
            parentValue.key.type === "Identifier" ? parentValue.key.name : "";
          const objVal =
            parentValue.value.type === "Identifier"
              ? parentValue.value.name
              : "";
          if (objKey === objVal)
            identifier.value.name = `${name}: ${objectName}.${name}`;
          else if (
            objVal === objectName &&
            parentValue.value.type === "Identifier"
          )
            parentValue.value.name = `${objectName}.${name}`;
        } else if (jcs.TSPropertySignature.check(parentValue)) {
          return identifier;
        } else {
          identifier.value.name = `${objectName}.${name}`;
        }
      } else identifier.value.name = `${objectName}.${name}`;
      return identifier;
    });
  });
}

function $lf(n: number) {
  return "$lf|src/utils/addAccessorsToObject.ts:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
