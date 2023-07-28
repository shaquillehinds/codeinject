#!/usr/bin/env node --experimental-specifier-resolution=node

import InjectionPipeline from "./pipeline/Injection.pipeline";
import reducerStateReturnStatement from "./templates/statements/reducerState.return.statement";

const statements = { reducerStateReturnStatement };

export { statements };
export default InjectionPipeline;
