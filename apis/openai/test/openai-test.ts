import fs from 'fs';
import { Jsonnet, getJsonnet } from '../../../jsonnet/libjsonnet';
import chai from 'chai';
chai.config.truncateThreshold = 0;

const url = 'https://api.openai.com/v1/chat/completions';

describe('open ai', () => {
  let jsonnet: Jsonnet;

  before(async () => {
    jsonnet = await getJsonnet();
  });

  describe('make request', () => {
    const requestTpl = fs.readFileSync(`${__dirname}/../lib/request-tpl.jsonnet`, 'utf-8');

    const expectedInHappyPath = {
        url,
        headers: {
          Authorization: 'Bearer is a secret1',
          'OpenAI-Organization': 'is a secret2',
        },
        body: {
          messages: [{role: 'user', content: 'is a prompt'}]
        },
      };

    it('happy path', async () => {
      const backStr = await jsonnet.evaluate(requestTpl, {
        prompt: 'is a prompt',
        secret1: 'is a secret1',
        secret2: 'is a secret2',
      });
      const back = JSON.parse(backStr);

      chai.expect(back).to.eql(expectedInHappyPath);
    });

    it('drop second auth header', async () => {
      const backStr = await jsonnet.evaluate(requestTpl, {
        prompt: 'is a prompt',
        secret1: 'is a secret1',
        secret2: '',
      });
      const back = JSON.parse(backStr);

      chai.expect(back).to.eql({
        ...expectedInHappyPath,
        headers: {
          Authorization: 'Bearer is a secret1',
        },
      });
    });
  });
});
