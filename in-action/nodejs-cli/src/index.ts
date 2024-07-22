import fs from 'fs';
import yargs from 'yargs';
import Ajv, { JSONSchemaType } from 'ajv';
import 'tplfa-jsonnet/wasm_exec.js';
import { Jsonnet, getJsonnet } from 'tplfa-jsonnet/jsonnet';
import { TplfaDocument, TplfaRequest } from '../../../tplfa/lib/types';

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
  // Load runtime
  //
  const jsonnetWasm = await fs.promises.readFile(
    require.resolve('tplfa-jsonnet/libjsonnet.wasm')
  );
  const jsonnet = await getJsonnet(jsonnetWasm);
  const ajv = new Ajv();
  const validateRequest = ajv.compile(
    JSON.parse(
      fs.readFileSync(`${__dirname}/../../../tplfa/schemas/request.json`, 'utf8')
    ) as JSONSchemaType<TplfaRequest>
  );
  const validateDocument = ajv.compile(
    JSON.parse(
      fs.readFileSync(`${__dirname}/../../../tplfa/schemas/document.json`, 'utf8')
    ) as JSONSchemaType<TplfaDocument>
  );

  //
  // Load APIs
  //
  function readFileNoExc(path: string): string | undefined {
    try {
      return fs.readFileSync(path, 'utf-8');
    } catch {
      return undefined;
    }
  }
  const reqTpls: string[] = argv.api.map(
    (api) => readFileNoExc(`${api}/request-tpl.jsonnet`)
  ).filter((c): c is string => !!c);
  const docTpls = argv.api.map(
    (api) => readFileNoExc(`${api}/document-tpl.jsonnet`)
  ).filter((c): c is string => !!c);
  docTpls.reverse();

  //
  // Build a request
  //
  async function nextReqTemplate(reqSoFar: Promise<string>, codeTpl: string, i: number): Promise<string> {
    const step = await jsonnet.evaluate(codeTpl, {
      parent: await reqSoFar,
      prompt: argv.prompt,
      secret1: argv.secret1,
      secret2: argv.secret2
    })
    if (argv.debug) {
      console.log(`tplfa: templated request [${i}]:\n${step}`);
    }
    return step;
  }
  const reqStr = await reqTpls.reduce(nextReqTemplate, Promise.resolve('{}'));

  const req = JSON.parse(reqStr);
  if (!validateRequest(req)) {
    console.log(`tplfa: invalid request:\nRequest: ${reqStr}\nErrors:j ${validateRequest.errors}`);
    return;
  }

  //
  // Make an API call
  //
  const url = req.url;
  const fetchParams = {
    ...req,
    url: undefined,
    body: JSON.stringify(req.body),
  };
  const respObj = await fetch(url, fetchParams);
  const resp = await respObj.text();

  if (argv.debug || !respObj.ok) {
    console.log(`tplfa: response from the api:\n${resp}`);
    if (!respObj.ok) {
      console.log(`tplfa: error code: ${respObj.status}`);
      return;
    }
  }

  //
  // Transform the response to a document
  //
  async function nextDocTemplate(respSoFar: Promise<string>, codeTpl: string, i: number): Promise<string> {
    const step = await jsonnet.evaluate(codeTpl, {
      response: await respSoFar,
    })
    if (argv.debug) {
      console.log(`tplfa: templated response [${i}]:\n${step}`);
    }
    return step;
  }
  const docStr = await docTpls.reduce(nextDocTemplate, Promise.resolve(resp));

  const doc = JSON.parse(docStr);
  function printDocument(doc: TplfaDocument) {
    console.log('tplfa: templated document:');
    console.log(JSON.stringify(doc, undefined, 2));
  }
  printDocument(doc);

  if (!validateDocument(doc)) {
    console.log('tplfa: invalid document:', validateDocument.errors);
    return;
  }
}

main();
