import fs from 'fs';
import yargs from 'yargs';
import Ajv, { JSONSchemaType } from 'ajv';
import { getJsonnet } from '../../jsonnet/libjsonnet/index';
import { TplfaRequest } from '../../tplfa/lib/types';

interface ToolArguments {
  requestTpl: string;
  prompt: string;
  secret1: string;
  secret2: string;
  debug: boolean;
}

async function parseCommandLine(): Promise<yargs.Arguments<ToolArguments>> {
  return await yargs
    .option('requestTpl', {
      alias: 'r',
      describe: 'Path to the template file',
      demandOption: true,
      type: 'string'
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
      describe: 'Print result of transformations',
      default: false,
      type: 'boolean'
    })
    .argv;
}

async function main() {
  const argv = await parseCommandLine();

  const ajv = new Ajv();
  const validateRequest = ajv.compile(
    JSON.parse(
      fs.readFileSync(`${__dirname}/../../tplfa/schemas/request.json`, 'utf8')
    ) as JSONSchemaType<TplfaRequest>
  );

  const code = fs.readFileSync(argv.requestTpl, 'utf-8');
  const jsonnet = await getJsonnet();
  const reqStr = await jsonnet.evaluate(code, {
    prompt: argv.prompt,
    secret1: argv.secret1,
    secret2: argv.secret2
  });

  const req = JSON.parse(reqStr);
  function printRequest(req: TplfaRequest) {
    console.log('tplfa: templated request:');
    console.log(JSON.stringify(req, undefined, 2));
  }
  if (argv.debug) {
    printRequest(req);
  }
  if (!validateRequest(req)) {
    console.log('tplfa: invalid request:', validateRequest.errors);
    printRequest(req);
    return;
  }

  const url = req.url;
  const fetchParams = {
    ...req,
    url: undefined,
    body: JSON.stringify(req.body),
  };
  const resp = await fetch(url, fetchParams);

  console.log(await resp.text());
}

main();
