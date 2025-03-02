export type YesOrNo = "Yes" | "No";

export interface KeywordReplace {
  keyword: string;
  replacement: string;
}

export interface FileFromTemplateOptions {
  newFilePath: string;
  templatePath: string;
  replaceKeywords: KeywordReplace[];
  instant?: boolean;
}
