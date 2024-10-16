import fs from 'fs';
import 'tplfa-jsonnet/wasm_exec.js';
import { Jsonnet, getJsonnet } from 'tplfa-jsonnet/jsonnet';
import chai from 'chai';
import fixtureRequest from '../fixture/request.json';
import fixtureResponse from '../fixture/response.json';
import fixtureDocument from '../fixture/document.json';
chai.config.truncateThreshold = 0;

const apiKey = 'LLM_KEY';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

describe('google gemini', () => {
  let jsonnet: Jsonnet;
  const requestTpl = fs.readFileSync(`${__dirname}/../lib/request-tpl.jsonnet`, 'utf-8');
  const documentTpl = fs.readFileSync(`${__dirname}/../lib/document-tpl.jsonnet`, 'utf-8');

  before(async () => {
    const jsonnetWasm = await fs.promises.readFile(
      require.resolve('tplfa-jsonnet/libjsonnet.wasm')
    );
    jsonnet = await getJsonnet(jsonnetWasm);
  });

  it('to request: happy path', async () => {
    const backStr = await jsonnet.evaluate(requestTpl, {
      prompt: 'hello',
      secret1: apiKey,
      secret2: 'is a secret2',
    });

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
