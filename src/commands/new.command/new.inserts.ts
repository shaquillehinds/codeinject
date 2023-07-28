import chalk from "chalk";
import { readFileSync, writeFileSync } from "fs";

interface InsertProps {
  name: string;
  nameL: string;
  collection: string;
}

function created(path: string) {
  console.info(`${chalk.greenBright("[Create]")}: ${path}`);
}

const finder = (props: InsertProps) => {
  const path = `src/pipeline/finders/${props.nameL}.finder.ts`;
  writeFileSync(
    path,
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
  created(path);
};

const stage = (props: InsertProps) => {
  const path = `src/pipeline/stages/${props.nameL}.inject.stage.ts`;
  writeFileSync(
    path,
    readFileSync(`src/templates/files/stage.template`, "utf-8")
      .replaceAll("{!template}", props.name)
      .replaceAll("{template}", props.nameL)
      .replaceAll("{collection}", props.collection),
    "utf-8"
  );
  created(path);
};

const newInserts = { finder, stage };

export default newInserts;
