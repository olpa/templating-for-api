import fs from 'fs';
import yargs from 'yargs';
import 'tplfa-jsonnet/wasm_exec.js';
import { Jsonnet, getJsonnet } from 'tplfa-jsonnet/jsonnet';
import { TplfaDocument, TplfaRequest } from 'tplfa/tplfa-types';

interface ToolArguments {
  api: string[];
  prompt: string;
  secret1: string;
  secret2: string;
  debug: boolean;
}

async function parseCommandLine(): Promise<yargs.Arguments<ToolArguments>> {
  return await yargs
    .option('api', {
      describe: 'Path to the api dir with files `request-tpl.jsonnet` and `document-tpl.jsonnet`',
      demandOption: true,
      type: 'string',
      array: true,
    })
    .option('prompt', {
      describe: 'Prompt value',
      default: 'ping',
      type: 'string'
    })
    .option('secret1', {
      describe: 'Secret value 1',
      default: process.env.OPENAI_API_KEY ?? '',
      type: 'string'
    })
    .option('secret2', {
      describe: 'Secret value 2',
      default: '',
      type: 'string'
    })
    .option('debug', {
      describe: 'Print results of transformations',
      default: false,
      type: 'boolean'
    })
    .argv;
}

async function main() {
  const argv = await parseCommandLine();

  //
  // Chain of APIs
  //
  if (!argv.api.length) {
    console.log("Specify at least on API");
    process.exit(-1);
  }
  const chain = argv.api.map((templatePath) => {{
    templatePath,
    secret1: argv.secret1,
    secret2: argv.secret2,
  }});

  //
  // Load runtime
  //
  const jsonnetWasm = await fs.promises.readFile(
    require.resolve('tplfa-jsonnet/libjsonnet.wasm')
  );
  const jsonnet = await getJsonnet(jsonnetWasm);
  const validator = new TplfaValidator();
  const tplfa = new TemplatingForApi(jsonnet, validator);

  //
  // API loader
  //
  function templateLoader(
    templatePath: string
  ) => Promise<TplfaResultOrError<LoadedTemplate>> {
    return {
      requestTpl: fs.readFileSync(`${templatePath}/request-tpl.jsonnet`, 'utf-8'),
      documentTpl: fs.readFileSync(`${templatePath}/document-tpl.jsonnet`, 'utf-8'),
    }
  }

  //
  // Run the chain
  //
  const apiClient = new ApiClient(
    fetch,
    tplfa,
    templateLoader,
    console.log.bind(console)
  );
  const doc = apiClient.call(chain, argv.prompt)

  //
  // Print the result
  //
  if (doc.ok) {
    console.log(JSON.stringify(doc.result, undefined, 2));
  } else {
    console.log(doc);
  }
}

main();
