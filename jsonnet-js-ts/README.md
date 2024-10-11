# jsonnet for TypeScript and JavaScript

## Installation

```
npm install tplfa-jsonnet
```

## Usage

Load the library in Node.js:

```
import 'tplfa-jsonnet/wasm_exec.js';
import { Jsonnet, getJsonnet } from 'tplfa-jsonnet/jsonnet';
...

const jsonnetWasm = await fs.promises.readFile(
  require.resolve('tplfa-jsonnet/libjsonnet.wasm')
);
jsonnet = await getJsonnet(jsonnetWasm);
```

Load the library in a browser:

```
<script src="/js/wasm_exec.js"></script>
<script src="/js/jsonnet-web.js"></script>
<script>
const jsonnetPromise = (async () => {
  console.log('Loading libjsonnet: started');
  const jnWasm = fetch('/js/libjsonnet.wasm');
  const jn = await getJsonnet(jnWasm);
  console.log('Loading libjsonnet: done');
  return jn;
})();
</script>
```

The object `jsonnet` provides two functions:

- `jsonnet_evaluate_snippet`: Wrapper for the corresponding jsonnet library function
- `evaluate`: Simplified interface. Only code, its external variables, and library files

The function signature:

```
evaluate: (
  //
  // Jsonnet code
  //
  code: string,

  //
  // Optional variables.
  // The values should be stringified.
  // For use in the Jsonnet code:
  //
  //   std.extVar("<var name>")
  //   std.parseJson(std.extVar("<var name>"))
  //
  extrStrs?: Record<string, string>,

  //
  // Optional library code. For use in the Jsonnet code:
  //
  //   import "<file name>"
  //
  files?: Record<string, string>

  //
  // Output: serialized JSON. Use `JSON.parse` to deserialize.
  //
) => Promise<string>;
```

### Full examples

See:

- Browser environment: [../in-action/web-jsonnet/](../in-action/web-jsonnet/)
- Node.js environment: [../in-action/nodejs-jsonnet/](../in-action/nodejs-jsonnet/)


## Compatibility note

For old versions of node you need to edit the file `wasm_exec.js`. After the line `use strict` add line `globalThis.crypto ??= require('crypto');`. Maybe more changes are needed: <https://github.com/golang/go/issues/53128>.


## License, Contact

MIT

Jsonnet: Apache license 2.0

Oleg Parashchenko <olpa@uucode.com>
