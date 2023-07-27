import { StagePipeline } from "../../pipeline";
import jcs from "jscodeshift";
import stages from "../../pipeline/stages";
import finders from "../../pipeline/finders";

export default async function newFinderCommandPipeline(name: string) {
  const nameL = name[0].toLowerCase() + name.slice(1);
  await new StagePipeline(jcs, "src/@types/finder.d.ts")
    .stage<StageTypeE.tsEnumMember, FinderTypeE.tsEnum>({
      stage: stages.injectTSEnumMemberStage,
      options: { key: nameL, value: nameL },
      finder: {
        func: finders.tsEnumFinder,
        options: { name: "FinderTypeE" },
      },
    })
    .stage<StageTypeE.stringTemplate, FinderTypeE.program>({
      stage: stages.injectStringTemplateStage,
      options: {
        template: `

      type ${name}FinderOptions = BaseFinderOptions & {}
    `,
      },
      finder: {
        func: finders.programFinder,
        options: {},
      },
    })
    // .injectArrayElement({}, {})
    .stage<StageTypeE.tsTypeAliasConditional, FinderTypeE.tsTypeAlias>({
      stage: stages.injectTSTypeAliasConditionalStage,
      options: {
        extendee: "T",
        extender: `FindTypeE.${nameL}@jcs.identifier`,
        trueClause: `${name}FinderOptions`,
      },
      finder: {
        func: finders.tsTypeAliasFinder,
        options: { name: "FinderOptions" },
      },
    })
    .parse("src/pipeline/finders/index.ts")
    .stage<StageTypeE.import, FinderTypeE.import>({
      stage: stages.injectImportStage,
      options: {
        importName: `${nameL}Finder`,
        source: `./${nameL}.finder`,
        isDefault: true,
      },
      finder: { func: finders.importFinder, options: {} },
    })
    .stage<StageTypeE.property, FinderTypeE.variableObject>({
      stage: stages.injectPropertyStage,
      options: {
        key: `${nameL}Finder`,
        value: `${nameL}Finder@jcs.identifier`,
      },
      finder: {
        func: finders.objectVariableFinder,
        options: { name: "finders" },
      },
    })
    .finish();
}
