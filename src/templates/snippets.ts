export function tsTypeAliasSnippet(typeName: string, typeValue: string) {
  return `
 
export type ${typeName} = ${typeValue}
  
  `;
}

export function tsEnumSnippet(enumName: string, key: string, value: string) {
  return `
  
export enum ${enumName} {
  ${key} = ${value}
}
  
  `;
}

export function namedExportSnippet(exportName: string, constName?: string) {
  if (constName)
    return `
  
 const ${constName} = { ${exportName} }

 export ${constName}
  
  `;
  return `

export { ${exportName} }

  `;
}

export function classSnippet(className: string, classMember: string) {
  return `

class ${className}{
  constructor(){}

  ${classMember}
}

`;
}
