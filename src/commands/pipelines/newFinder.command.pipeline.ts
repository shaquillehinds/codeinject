import InjectionPipeline from "@src/pipeline/Injection.pipeline";
import config from "@src/../.prettierrc.cjs";

export default async function newFinderCommandPipeline(
  name: string,
  finderOptions: string,
  collection?: string
) {
  const nameL = name[0].toLowerCase() + name.slice(1);

  await new InjectionPipeline("src/@types/finder.ts", config)
    .injectTSEnumMember({ key: nameL, value: nameL }, { name: "FinderTypeE" })
    .injectStringTemplate({
      template: `

      export type ${name}FinderOptions = BaseFinderOptions & {
        ${finderOptions}
      }
    `
    })
    .injectTSTypeAliasConditional(
      {
        extendee: "T",
        extender: nameL,
        trueClause: `${name}FinderOptions`
      },
      { name: "FinderOptions" }
    )

    .parse("src/@types/finder.enums.ts")
    .injectTSEnumMember({ key: nameL, value: nameL }, { name: "FinderTypeE" })
    .parse("src/pipeline/finders/index.ts")
    .injectImport({
      importName: `${nameL}Finder`,
      source: `./${nameL}.finder`,
      isDefault: true
    })
    .injectProperty(
      {
        key: `${nameL}Finder`,
        value: `${nameL}Finder@jcs.identifier`
      },
      { name: "finders" }
    )

    .injectFileFromTemplate({
      templatePath: "src/templates/files/finder.template",
      newFilePath: `src/pipeline/finders/${nameL}.finder.ts`,
      replaceKeywords: [
        { keyword: "{!template}", replacement: name },
        { keyword: "{template}", replacement: nameL },
        { keyword: "{collection}", replacement: collection || "" },
        {
          keyword: "{find}",
          replacement: collection ? `.find(jcs.${collection})` : ""
        }
      ]
    })
    .finish();
}
