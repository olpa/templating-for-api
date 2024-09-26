import fs from 'fs';
import 'tplfa-jsonnet/wasm_exec.js';
import { Jsonnet, getJsonnet } from 'tplfa-jsonnet/jsonnet';
import chai from 'chai';
import fixtureRequest from '../fixture/request.json';
import fixtureResponse from '../fixture/response.json';
import fixtureDocument from '../fixture/document.json';
chai.config.truncateThreshold = 0;

const url = 'https://api.openai.com/v1/chat/completions';

describe('open ai', () => {
  let jsonnet: Jsonnet;
  const libFiles = {
    'openai-request-tpl.jsonnet': fs.readFileSync(`${__dirname}/../../lib/openai-request-tpl.jsonnet`, 'utf-8'),
  }

  before(async () => {
    const jsonnetWasm = await fs.promises.readFile(
      require.resolve('tplfa-jsonnet/libjsonnet.wasm')
    );
    jsonnet = await getJsonnet(jsonnetWasm);
  });

  describe('make request', () => {
    const requestTpl = fs.readFileSync(`${__dirname}/../lib/request-tpl.jsonnet`, 'utf-8');

    const expectedInHappyPath = {
        url,
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization: 'Bearer is a secret1',
          'OpenAI-Organization': 'is a secret2',
        },
        body: fixtureRequest,
      };

    it('happy path', async () => {
      const backStr = await jsonnet.evaluate(requestTpl, {
        prompt: 'Ping!',
        secret1: 'is a secret1',
        secret2: 'is a secret2',
      }, libFiles);
      const back = JSON.parse(backStr);

      chai.expect(back).to.eql(expectedInHappyPath);
    });

    it('drop second auth header', async () => {
      const backStr = await jsonnet.evaluate(requestTpl, {
        prompt: 'Ping!',
        secret1: 'is a secret1',
        secret2: '',
      }, libFiles);
      const back = JSON.parse(backStr);

      chai.expect(back).to.eql({
        ...expectedInHappyPath,
        headers: {
          'Content-type': 'application/json',
          Authorization: 'Bearer is a secret1',
        },
      });
    });

    it('patch a request', async () => {
      const patchTpl = fs.readFileSync(
        `${__dirname}/../../openai-patch-example/lib/request-tpl.jsonnet`,
        'utf-8'
      );

      const backStr = await jsonnet.evaluate(patchTpl, {
        parent: JSON.stringify(expectedInHappyPath),
      }, libFiles);
      const back = JSON.parse(backStr);

      chai.expect(back).to.eql({
        ...expectedInHappyPath,
        body: {
          ...expectedInHappyPath.body,
          // added by the patch
          n: 3,
          temperature: 0.8,
        },
      });
    });
  });

  describe('response to document', () => {
    const documentTpl = fs.readFileSync(`${__dirname}/../lib/document-tpl.jsonnet`, 'utf-8');

    it('happy path', async () => {
      const doc = JSON.parse(await jsonnet.evaluate(
        documentTpl,
        { response: JSON.stringify(fixtureResponse)}
      ));

      chai.expect(doc).to.eql(fixtureDocument);
    });
  });
});
