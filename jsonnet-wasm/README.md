# jsonnet for WebAssembly

Plus:

- TypeScript wrapper,
- JavaScript wrapper,
- packaged for `npm`

# Compile the jsonnet library

The script `build_wasm.sh` compiles [go-jsonnet](https://github.com/google/go-jsonnet) project to WASM and stores the result in the folder `./dist`.

# The wrapper

## TypeScript

The module `./libjsonnet` defines two function:

- `jsonnet_evaluate_snippet`: Wrapper for the corresponding jsonnet library function
- `evaluate`: Simplified interface. Only code and its external variables

## JavaScript

Compile the JavaScript version from the TypeScript version using the script `build-js.sh`. The output is in `dist-npm/jsonnet.js`.

For old versions of node you need to edit the file `./dist/wasm_exec.js`. After the line `use strict` add line `globalThis.crypto ??= require('crypto');`. Maybe more changes are needed: <https://github.com/golang/go/issues/53128>.

# Usage

For sample usage in Nodejs, see [../in-action/nodejs-cli/](../in-action/nodejs-cli/).

TODO: npm
