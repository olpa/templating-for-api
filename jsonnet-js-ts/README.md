# jsonnet for TypeScript and JavaScript

# Compile the jsonnet library

The script `build-js.sh` compiles the JavaScript version from the TypeScript version, and puts the resulting `jsonnet.js` to the folder `dist`. The `dist` can be used by `npm`.

## TypeScript

The module `./libjsonnet` defines two function:

- `jsonnet_evaluate_snippet`: Wrapper for the corresponding jsonnet library function
- `evaluate`: Simplified interface. Only code and its external variables

## JavaScript

For old versions of node you need to edit the file `./dist/wasm_exec.js`. After the line `use strict` add line `globalThis.crypto ??= require('crypto');`. Maybe more changes are needed: <https://github.com/golang/go/issues/53128>.

# Usage

For sample usage in Nodejs, see [../in-action/nodejs-cli/](../in-action/nodejs-cli/).

TODO: npm
