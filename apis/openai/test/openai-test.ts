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
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization: 'Bearer is a secret1',
          'OpenAI-Organization': 'is a secret2',
        },
        body: {
          messages: [{role: 'user', content: 'is a prompt'}],
          model: 'gpt-3.5-turbo',
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
          'Content-type': 'application/json',
          Authorization: 'Bearer is a secret1',
        },
      });
    });
  });

  describe('response to document', () => {
    const documentTpl = fs.readFileSync(`${__dirname}/../lib/document-tpl.jsonnet`, 'utf-8');

    const openaiResponseExample = {
      "id": "chatcmpl-9CKV4SYeEJFiXexesvNDpxp5tfAiI",
      "object": "chat.completion",
      "created": 1712725766,
      "model": "gpt-3.5-turbo-0125",
      "choices": [
        {
          "index": 0,
          "message": {
            "role": "assistant",
            "content": "Pong!"
          },
          "logprobs": null,
          "finish_reason": "stop"
        }
      ],
      "usage": {
        "prompt_tokens": 8,
        "completion_tokens": 3,
        "total_tokens": 11
      },
      "system_fingerprint": "fp_b28b39ffa8"
    }

    it('happy path', async () => {
      const doc = JSON.parse(await jsonnet.evaluate(
        documentTpl,
        { response: JSON.stringify(openaiResponseExample)}
      ));

      chai.expect(doc).to.eql({
        doc: [{ type: 'markdown', content: [{ type: 'text', text: 'Pong!' }] }],
      });
    });
  });
});
