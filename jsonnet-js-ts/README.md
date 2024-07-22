# jsonnet for TypeScript and JavaScript

For sample usage in Nodejs, see [../in-action/nodejs-cli/](../in-action/nodejs-cli/).

Installation:

```
npm install https://github.com/olpa/TODO path to release
```

In code:

```
import 'tplfa-jsonnet/wasm_exec.js';
import { Jsonnet, getJsonnet } from 'tplfa-jsonnet/jsonnet';
...

const jsonnetWasm = await fs.promises.readFile(
  require.resolve('tplfa-jsonnet/libjsonnet.wasm')
);
jsonnet = await getJsonnet(jsonnetWasm);
```

The object `jsonnet` provides two functions:

- `jsonnet_evaluate_snippet`: Wrapper for the corresponding jsonnet library function
- `evaluate`: Simplified interface. Only code and its external variables

Compatibility note:

For old versions of node you need to edit the file `./dist/wasm_exec.js`. After the line `use strict` add line `globalThis.crypto ??= require('crypto');`. Maybe more changes are needed: <https://github.com/golang/go/issues/53128>.
