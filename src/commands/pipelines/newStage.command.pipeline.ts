import InjectionPipeline from "@src/pipeline/Injection.pipeline";

export default async function newStageCommandPipeline(
  name: string,
  finderName: string,
  options: string,
  collection: string = ""
) {
  const nameL = name[0].toLowerCase() + name.slice(1);
  await new InjectionPipeline("src/@types/stage.ts")
    .injectTSEnumMember({ key: nameL, value: nameL }, { name: "StageTypeE" })
    .injectStringTemplate({
      template: `

    type ${name}Options =  {
      ${options}
      col?: Collection${
        collection ? `<import("jscodeshift").${collection}>` : ""
      };
    } & BaseStageOptions
  `
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
      isDefault: true
    })
    .injectProperty(
      { key: `inject${name}Stage`, value: `inject${name}Stage@jcs.identifier` },
      { name: "stages" }
    )
    .parse("src/pipeline/Injection.pipeline.ts")
    .injectClassMember(
      {
        stringTemplate: `

    public inject${name}(
      stageOptions: StageOptions<"${nameL}">,
      finderOptions: FinderOptions<"${finderName}">
    ) {
      if (!this.ast) this.parse();
      stageOptions.col = f.${finderName}Finder(j, this.ast!, finderOptions);
      s.inject${name}Stage(j, this.ast!, stageOptions);
      return this;
    }

    `
      },
      { name: "InjectionPipeline" }
    )

    .injectFileFromTemplate({
      templatePath: "src/templates/files/stage.template",
      newFilePath: `src/pipeline/stages/${nameL}.inject.stage.ts`,
      replaceKeywords: [
        { keyword: "{!template}", replacement: name },
        { keyword: "{template}", replacement: nameL },
        { keyword: "{collection}", replacement: collection || "" }
      ]
    })
    .parse("tests/stages.test.ts")
    .injectStringTemplate({
      template: `
    describe("inject${name}", () => {
      const finderOptions: FinderOptions<"${finderName}"> = { name: "[identifierName]" };
      const stageOptions: StageOptions<"${nameL}"> = {${options}};
      const expectedInjection = '';
      test('Should ', () => {
        pipeline.inject${name}(stageOptions, finderOptions);
        testSourceForInjection(expectedInjection, "toBeTruthy");
      });
    });
    `
    })
    .finish([
      "tests/stages.test.ts",
      "tests/test.template.ts",
      "src/@types/stage.ts",
      `src/pipeline/stages/${nameL}.inject.stage.ts`
    ]);
}
