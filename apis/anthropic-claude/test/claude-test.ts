import fs from 'fs';
import 'tplfa-jsonnet/wasm_exec.js';
import { Jsonnet, getJsonnet } from 'tplfa-jsonnet/jsonnet';
import chai from 'chai';
import fixtureRequest from '../../openai/fixture/request.json';
chai.config.truncateThreshold = 0;

const url = 'https://api.openai.com/v1/chat/completions';

describe('open ai', () => {
  let jsonnet: Jsonnet;

  before(async () => {
    const jsonnetWasm = await fs.promises.readFile(
      require.resolve('tplfa-jsonnet/libjsonnet.wasm')
    );
    jsonnet = await getJsonnet(jsonnetWasm);
  });

  describe('make request', () => {
    const templateRequestTpl = fs.readFileSync(`${__dirname}/../../shared/openai-request-tpl.jsonnet`, 'utf-8');
    const requestTpl = fs.readFileSync(`${__dirname}/../lib/request-tpl.jsonnet`, 'utf-8');

    const expectedInHappyPath = {
        url,
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'X-api-key': 'is a secret1',
        },
        body: fixtureRequest,
      };

    it('happy path', async () => {
      const backStr = await jsonnet.evaluate(requestTpl, {
        prompt: 'Ping!',
        secret1: 'is a secret1',
        secret2: 'is a secret2',
      }, { "openai-request-tpl.jsonnet": templateRequestTpl });
      const back = JSON.parse(backStr);

      chai.expect(back).to.eql(expectedInHappyPath);
    });
  });
});
