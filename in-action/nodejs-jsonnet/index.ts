import fs from 'fs';
import 'tplfa-jsonnet/wasm_exec.js';
import { Jsonnet, getJsonnet } from 'tplfa-jsonnet/jsonnet';

const code = `
// Jsonnet Example
{
    person1: {
        name: "Alice",
        welcome: "Hello " + self.name + "!",
    },
    person2: self.person1 { name: "Bob" },
    person3: self.person2 { name: std.extVar("name") },
}
`;

async function main(): Promise<void> {
  const jsonnetWasm = await fs.promises.readFile(
    require.resolve('tplfa-jsonnet/libjsonnet.wasm')
  );
  const jsonnet = await getJsonnet(jsonnetWasm);

  const outStr = await jsonnet.evaluate(code, {
    name: 'Kitty',
  });
  const out = JSON.parse(outStr);

  console.log(out);
}

main();
