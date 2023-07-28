import InjectionPipeline from "@src/pipeline/Injection.pipeline";

export default async function newStageCommandPipeline(
  name: string,
  finderName: string,
  options: string,
  collection: string = ""
) {
  const nameL = name[0].toLowerCase() + name.slice(1);
  await new InjectionPipeline("src/@types/stage.d.ts")
    .injectTSEnumMember({ key: nameL, value: nameL }, { name: "StageTypeE" })
    .injectStringTemplate({
      template: `

    type ${name}Options =  {
      ${options}
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
    .parse("src/pipeline/Stage.pipeline.ts")
    .injectClassMember(
      {
        stringTemplate: `

    public inject${name}(
      stageOptions: StageOptions<"${nameL}">,
      finderOptions: FinderOptions<"${finderName}">
    ) {
      if (!this.ast) this.parse();
      stageOptions.col = f.${finderName}Finder(this.j, this.ast!, finderOptions);
      s.inject${name}Stage(this.j, this.ast!, stageOptions);
      return this;
    }

    `,
      },
      { name: "StagePipeline" }
    )
    .finish();
}
