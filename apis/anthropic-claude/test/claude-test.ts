import fs from 'fs';
import 'tplfa-jsonnet/wasm_exec.js';
import { Jsonnet, getJsonnet } from 'tplfa-jsonnet/jsonnet';
import chai from 'chai';
import fixtureRequest from '../../openai/fixture/request.json';
chai.config.truncateThreshold = 0;

const url = 'https://api.anthropic.com/v1/messages';

describe('open ai', () => {
  let jsonnet: Jsonnet;

  before(async () => {
    const jsonnetWasm = await fs.promises.readFile(
      require.resolve('tplfa-jsonnet/libjsonnet.wasm')
    );
    jsonnet = await getJsonnet(jsonnetWasm);
  });

  describe('make request', () => {
    const libFileName = 'openai-request-tpl.jsonnet'
    const libRequestTpl = fs.readFileSync(`${__dirname}/../../shared/${libFileName}`, 'utf-8');
    const requestTpl = fs.readFileSync(`${__dirname}/../lib/request-tpl.jsonnet`, 'utf-8');

    const expectedInHappyPath = {
        url,
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'X-api-key': 'is a secret1',
          'Anthropic-version': '2023-06-01',
        },
        body: {
          ...fixtureRequest,
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 1024,
        }
      };

    it('happy path', async () => {
      const backStr = await jsonnet.evaluate(requestTpl, {
        prompt: 'Ping!',
        secret1: 'is a secret1',
        secret2: 'is a secret2',
      }, { [libFileName]: libRequestTpl });

      const back = JSON.parse(backStr);
      chai.expect(back).to.eql(expectedInHappyPath);
    });
  });
});
