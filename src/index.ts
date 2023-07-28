#!/usr/bin/env node --experimental-specifier-resolution=node

import InjectionPipeline from "./pipeline/Injection.pipeline";
import reducerStateReturnStatement from "./templates/statements/reducerState.return.statement";

export { reducerStateReturnStatement };
export default InjectionPipeline;
