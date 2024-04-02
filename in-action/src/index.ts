import { getJsonnet } from '../../jsonnet/libjsonnet/index';

async function main() {
  const jsonnet = await getJsonnet();
  const code = `
    // Jsonnet Example
    {
        person1: {
            name: "Alice",
            welcome: "Hello " + self.name + "!",
        },
        person2: self.person1 { name: "Bob" },
    }
  `;

  const back = await jsonnet.evaluate(
    'test.ts',
    code,
    { 'test.ts': code },
    {}, {}, {}, {}
  );
  console.log(back);
}

main();
