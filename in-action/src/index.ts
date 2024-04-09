import { getJsonnet } from '../../jsonnet/libjsonnet/index';
import yargs from 'yargs';
import fs from 'fs';

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

  const code = fs.readFileSync(argv.requestTpl, 'utf-8');
  const jsonnet = await getJsonnet();
  const reqStr = await jsonnet.evaluate(code, {
    prompt: argv.prompt,
    secret1: argv.secret1,
    secret2: argv.secret2
  });

  const req = JSON.parse(reqStr);
  if (argv.debug) {
    console.log('tplfa: templated request:');
    console.log(JSON.stringify(req, undefined, 2));
  }

  const url = req.url;
  delete req.url;
  req.body = JSON.stringify(req.body);
  const resp = await fetch(url, req);

  console.log(await resp.text());
}

main();
