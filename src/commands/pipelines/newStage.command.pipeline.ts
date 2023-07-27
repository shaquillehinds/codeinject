import { StagePipeline } from "../../pipeline";
import jcs from "jscodeshift";

export default async function newStageCommandPipeline(
  name: string,
  collection?: string
) {
  const nameL = name[0].toLowerCase() + name.slice(1);
  await new StagePipeline(jcs, "src/@types/stage.d.ts")
    .injectTSEnumMember({ key: nameL, value: nameL }, { name: "StageTypeE" })
    .injectStringTemplate({
      template: `

    type ${name}Options =  {
      col?: Collection${
        collection ? `<import("jscodeshift").${collection}>` : ""
      };
    } & BaseStageOptions
  `,
    })
    .injectTSTypeAliasConditional(
      { extendee: "T", extender: nameL, trueClause: `${name}Options` },
      { name: "StageOptions" }
    )
    .parse("src/@types/stage.enums.ts")
    .injectTSEnumMember({ key: nameL, value: nameL }, { name: "StageTypeE" })
    .injectTSEnumMember(
      { key: nameL, value: `inject${name}Stage` },
      { name: "StageNameE" }
    )
    .parse("src/pipeline/stages/index.ts")
    .injectImport({
      importName: `inject${name}Stage`,
      source: `./${nameL}.inject.stage`,
      isDefault: true,
    })
    .injectProperty(
      { key: `inject${name}Stage`, value: `inject${name}Stage@jcs.identifier` },
      { name: "stages" }
    )
    .finish();
}
