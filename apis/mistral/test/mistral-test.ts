import fs from 'fs';
import 'tplfa-jsonnet/wasm_exec.js';
import { Jsonnet, getJsonnet } from 'tplfa-jsonnet/jsonnet';
import chai from 'chai';
import fixtureRequest from '../fixture/request.json';
import fixtureResponse from '../fixture/response.json';
import fixtureDocument from '../fixture/document.json';
chai.config.truncateThreshold = 0;

const url = 'https://api.mistral.ai/v1/chat/completions';

describe('mistral', () => {
  let jsonnet: Jsonnet;
  const libFileName = 'openai-request-tpl.jsonnet'
  const libRequestTpl = fs.readFileSync(`${__dirname}/../../lib/${libFileName}`, 'utf-8');
  const requestTpl = fs.readFileSync(`${__dirname}/../lib/request-tpl.jsonnet`, 'utf-8');
  const documentTpl = fs.readFileSync(`${__dirname}/../../lib/openai-document-tpl.jsonnet`, 'utf-8');

  before(async () => {
    const jsonnetWasm = await fs.promises.readFile(
      require.resolve('tplfa-jsonnet/libjsonnet.wasm')
    );
    jsonnet = await getJsonnet(jsonnetWasm);
  });

  it('to request: happy path', async () => {
    const backStr = await jsonnet.evaluate(requestTpl, {
      prompt: 'hello',
      secret1: 'test-token',
      secret2: '',
    }, { [libFileName]: libRequestTpl });

    const back = JSON.parse(backStr);
    chai.expect(back).to.eql(fixtureRequest);
  });

  it('response to document: happy path', async () => {
    const doc = JSON.parse(await jsonnet.evaluate(
      documentTpl,
      { response: JSON.stringify(fixtureResponse)}
    ));

    chai.expect(doc).to.eql(fixtureDocument);
  });
});
