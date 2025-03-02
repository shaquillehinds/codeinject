# Codeinject

## Inject code into your typescript files

### Release v.2.3.0

New Finders

- existingImport
- useEffect
- function
- return

#### InjectionPipeline Class

New Injection Methods

- injectFunctionBody
- injectReturnObjectProperty
- injectImportsFromFile
- injectReturnAllFunctionVariables
- injectFunctionParams
- injectObjectForAccessors
- injectToProgram
- injectReturnStatement

New Statics

- getFinder
- getStage
- getName
- getNames
- getBodyNodes
- getFunctionParams
- objParamToIdentifier
- NodeGrouper

New Public Get Accessors

- location
- updateFileContent
- originalFileContent
- variableNames

New Public Methods

- getOriginalFileContent
- storeFileVariable
- customInject
- parseString
- commit
