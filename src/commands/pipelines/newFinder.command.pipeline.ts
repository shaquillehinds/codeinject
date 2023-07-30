import InjectionPipeline from "@src/pipeline/Injection.pipeline";
import config from "@src/../.prettierrc.js";

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
    .parse("tests/finders.test.ts")
    .injectStringTemplate({
      template: `
   describe("${nameL}Finder", () => {
     const type = "${collection}";
     const col = finders.${nameL}Finder(jcs, ast, { name: "[identifierName]" });
   
     test("${collection}: Should return a ${collection} collection with 1 path.", () => {
       expect(col.size()).toBe(1);
       expect(col.getTypes()[0]).toBe(type);
     });
   });
   `
    })
    .finish([
      "tests/finders.test.ts",
      `src/pipeline/finders/${nameL}.finder.ts`,
      "src/@types/finder.ts"
    ]);
}
