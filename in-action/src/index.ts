import fs from 'fs';
import yargs from 'yargs';
import Ajv, { JSONSchemaType } from 'ajv';
import { getJsonnet } from '../../jsonnet/libjsonnet/index';
import { TplfaDocument, TplfaRequest } from '../../tplfa/lib/types';

interface ToolArguments {
  api: string;
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

  //
  // Load runtime
  //
  const codeMkRequest = fs.readFileSync(`${argv.api}/request-tpl.jsonnet`, 'utf-8');
  const codeMkDocument = fs.readFileSync(`${argv.api}/document-tpl.jsonnet`, 'utf-8');
  const jsonnet = await getJsonnet();

  const ajv = new Ajv();
  const validateRequest = ajv.compile(
    JSON.parse(
      fs.readFileSync(`${__dirname}/../../tplfa/schemas/request.json`, 'utf8')
    ) as JSONSchemaType<TplfaRequest>
  );
  const validateDocument = ajv.compile(
    JSON.parse(
      fs.readFileSync(`${__dirname}/../../tplfa/schemas/document.json`, 'utf8')
    ) as JSONSchemaType<TplfaDocument>
  );

  //
  // Build a request
  //
  const reqStr = await jsonnet.evaluate(codeMkRequest, {
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
  const docStr = await jsonnet.evaluate(codeMkDocument, {
    response: resp
  });

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
