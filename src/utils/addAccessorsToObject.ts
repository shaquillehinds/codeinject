import jcs from "jscodeshift";

type AddAccessorsToObjectProps = {
  objectName: string;
  accessors: string[];
  collection: jcs.Collection;
};
export default function addAccessorsToObject(props: AddAccessorsToObjectProps) {
  const { objectName, accessors, collection } = props;
  accessors.forEach((name: string) => {
    collection.find(jcs.Identifier, { name }).map(identifier => {
      const parentValue = identifier.parentPath.value;
      if (jcs.Node.check(parentValue)) {
        if (parentValue.type !== "ObjectProperty") {
          identifier.value.name = `${objectName}.${name}`;
        } else identifier.value.name = `${name}: ${objectName}.${name}`;
      } else identifier.value.name = `${objectName}.${name}`;
      return identifier;
    });
  });
}
