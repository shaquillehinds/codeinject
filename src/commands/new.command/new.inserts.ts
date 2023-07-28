import { readFileSync, writeFileSync } from "fs";

const finder = (name: string, nameL: string, collection: string) =>
  writeFileSync(
    `src/pipeline/finders/${nameL}.finder.ts`,
    readFileSync(`src/templates/files/finder.template`, "utf-8")
      .replaceAll("{!template}", name)
      .replaceAll("{template}", nameL)
      .replaceAll("{collection}", collection)
      .replace("{find}", collection ? `.find(jcs.${collection})` : ""),
    "utf-8"
  );

const stage = (name: string, nameL: string, collection: string) =>
  writeFileSync(
    `src/pipeline/stages/${nameL}.inject.stage.ts`,
    readFileSync(`src/templates/files/stage.template`, "utf-8")
      .replaceAll("{!template}", name)
      .replaceAll("{template}", nameL)
      .replaceAll("{collection}", collection),
    "utf-8"
  );

const newInserts = { finder, stage };

export default newInserts;
