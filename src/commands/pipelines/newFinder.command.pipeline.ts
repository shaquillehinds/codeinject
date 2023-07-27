import { StagePipeline } from "../../pipeline";
import jcs from "jscodeshift";
import stages from "../../pipeline/stages";
import finders from "../../pipeline/finders";

export default async function newFinderCommandPipeline(name: string) {
  const nameL = name[0].toLowerCase() + name.slice(1);
  await new StagePipeline(jcs, "src/@types/finder.d.ts")
    .stage<StageTypeE.tsEnumMember>({
      stage: stages.injectTSEnumMemberStage,
      options: { key: nameL, value: nameL },
      finder: {
        func: finders.tsEnumFinder,
        options: { type: "tsEnum", name: "FinderTypeE" },
      },
    })
    .stage<StageTypeE.stringTemplate>({
      stage: stages.injectStringTemplateStage,
      options: {
        template: `

      type ${name}FinderOptions = BaseFinderOptions & {
        type: "${nameL}";
        name: string
      }
    `,
      },
      finder: {
        func: finders.programFinder,
        options: { type: "program" },
      },
    })
    .stage<StageTypeE.tsTypeAlias>({
      stage: stages.injectTSTypeAliasStage,
      options: {
        stringTemplate: `
        ${name}FinderOptions
    `,
        type: "union",
      },
      finder: {
        func: finders.tsTypeAliasFinder,
        options: { type: "tsTypeAlias", name: "FinderOptions" },
      },
    })
    .parse("src/pipeline/finders/index.ts")
    .stage<StageTypeE.import>({
      stage: stages.injectImportStage,
      options: {
        importName: `${nameL}Finder`,
        source: `./${nameL}.finder`,
        isDefault: true,
      },
      finder: { func: finders.importFinder, options: { type: "import" } },
    })
    .stage<StageTypeE.property>({
      stage: stages.injectPropertyStage,
      options: {
        key: `${nameL}Finder`,
        value: `${nameL}Finder@jcs.identifier`,
      },
      finder: {
        func: finders.objectVariableFinder,
        options: { name: "finders", type: "variableObject" },
      },
    })
    .finish();
}
