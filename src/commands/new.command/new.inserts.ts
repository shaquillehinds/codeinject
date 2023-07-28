import { readFileSync, writeFileSync } from "fs";

interface InsertProps {
  name: string;
  nameL: string;
  collection: string;
}

const finder = (props: InsertProps) =>
  writeFileSync(
    `src/pipeline/finders/${props.nameL}.finder.ts`,
    readFileSync(`src/templates/files/finder.template`, "utf-8")
      .replaceAll("{!template}", props.name)
      .replaceAll("{template}", props.nameL)
      .replaceAll("{collection}", props.collection)
      .replace(
        "{find}",
        props.collection ? `.find(jcs.${props.collection})` : ""
      ),
    "utf-8"
  );

const stage = (props: InsertProps) =>
  writeFileSync(
    `src/pipeline/stages/${props.nameL}.inject.stage.ts`,
    readFileSync(`src/templates/files/stage.template`, "utf-8")
      .replaceAll("{!template}", props.name)
      .replaceAll("{template}", props.nameL)
      .replaceAll("{collection}", props.collection),
    "utf-8"
  );

const newInserts = { finder, stage };

export default newInserts;
