import { StagePipeline } from "../../pipeline";
import jcs from "jscodeshift";
import stages from "../../pipeline/stages";
import finders from "../../pipeline/finders";

export default async function newStageCommandPipeline(
  name: string,
  collection?: string
) {
  const nameL = name[0].toLowerCase() + name.slice(1);
  await new StagePipeline(jcs, "src/@types/stage.d.ts")
    .stage<StageTypeE.tsEnumMember, FinderTypeE.tsEnum>({
      stage: stages.injectTSEnumMemberStage,
      options: { key: nameL, value: nameL },
      finder: {
        func: finders.tsEnumFinder,
        options: { name: "StageTypeE" },
      },
    })
    .stage<StageTypeE.stringTemplate, FinderTypeE.program>({
      stage: stages.injectStringTemplateStage,
      options: {
        template: `

      type ${name}Options =  {
        col?: Collection${
          collection ? `<import("jscodeshift").${collection}>` : ""
        };
      } & BaseStageOptions
    `,
      },
      finder: {
        func: finders.programFinder,
        options: {},
      },
    })
    .stage<StageTypeE.tsTypeAliasConditional, FinderTypeE.tsTypeAlias>({
      stage: stages.injectTSTypeAliasConditionalStage,
      options: {
        extendee: "T",
        extender: nameL,
        trueClause: `${name}Options`,
      },
      finder: {
        func: finders.tsTypeAliasFinder,
        options: { name: "StageOptions" },
      },
    })
    .parse("src/@types/stage.enums.ts")
    .stage<StageTypeE.tsEnumMember, FinderTypeE.tsEnum>({
      stage: stages.injectTSEnumMemberStage,
      finder: {
        func: finders.tsEnumFinder,
        options: { name: "StageTypeE" },
      },
      options: { key: nameL, value: nameL },
    })
    .stage<StageTypeE.tsEnumMember, FinderTypeE.tsEnum>({
      stage: stages.injectTSEnumMemberStage,
      finder: {
        func: finders.tsEnumFinder,
        options: { name: "StageNameE" },
      },
      options: { key: nameL, value: `inject${name}Stage` },
    })
    .parse("src/pipeline/stages/index.ts")
    .stage<StageTypeE.import, FinderTypeE.import>({
      stage: stages.injectImportStage,
      options: {
        importName: `inject${name}Stage`,
        source: `./${nameL}.inject.stage`,
        isDefault: true,
      },
      finder: { func: finders.importFinder, options: {} },
    })
    .stage<StageTypeE.property, FinderTypeE.variableObject>({
      stage: stages.injectPropertyStage,
      options: {
        key: `inject${name}Stage`,
        value: `inject${name}Stage@jcs.identifier`,
      },
      finder: {
        func: finders.objectVariableFinder,
        options: { name: "stages" },
      },
    })
    .finish();
}
