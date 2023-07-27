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
    .stage<StageTypeE.tsEnumMember>({
      stage: stages.injectTSEnumMemberStage,
      options: { key: nameL, value: nameL },
      finder: {
        func: finders.tsEnumFinder,
        options: { type: "tsEnum", name: "StageTypeE" },
      },
    })
    .stage<StageTypeE.stringTemplate>({
      stage: stages.injectStringTemplateStage,
      options: {
        template: `

      type ${name}Options =  {
        col?: Collection${
          collection ? `<import("jscodeshift").${collection}>` : ""
        };
      }
    `,
      },
      finder: {
        func: finders.programFinder,
        options: { type: "program" },
      },
    })
    .stage<StageTypeE.tsTypeAliasConditional>({
      stage: stages.injectTSTypeAliasConditionalStage,
      options: {
        extendee: "T",
        extender: nameL,
        trueClause: `${name}Options`,
      },
      finder: {
        func: finders.tsTypeAliasFinder,
        options: { type: "tsTypeAlias", name: "StageOptions" },
      },
    })
    .finish();

  console.log(name, nameL);
  await new StagePipeline(jcs, "src/pipeline/stages/index.ts")
    .stage<StageTypeE.import>({
      stage: stages.injectImportStage,
      options: {
        importName: `inject${name}Stage`,
        source: `./${nameL}.inject.stage`,
        isDefault: true,
      },
      finder: { func: finders.importFinder, options: { type: "import" } },
    })
    .stage<StageTypeE.property>({
      stage: stages.injectPropertyStage,
      options: {
        key: `inject${name}Stage`,
        value: `inject${name}Stage@jcs.identifier`,
      },
      finder: {
        func: finders.objectVariableFinder,
        options: { name: "stages", type: "variableObject" },
      },
    })
    .finish();
}
