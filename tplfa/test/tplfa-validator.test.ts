import { TplfaRequest } from '../src/tplfa-types';
import { TplfaValidator } from '../src/tplfa-validator';

describe('tplfa validator', () => {
  const validator = new TplfaValidator();

  describe('validate templating request', () => {
    const validRequest: TplfaRequest = {
      url: 'https://example.com',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: { foo: 'bar' },
    };

    it('happy path', () => {
      const validation = validator.validateTplfaRequest(validRequest);

      expect(validation).toEqual({
        ok: true,
        result: validRequest,
      });
    });

    const required: Array<keyof TplfaRequest> = ['url', 'method', 'body'];
    required.forEach((prop) => {
      it(`missing ${prop}`, () => {
        const invalid = { ...validRequest };
        delete invalid[prop];

        const validation = validator.validateTplfaRequest(invalid);

        expect(validation).toEqual({
          ok: false,
          error: `data must have required property '${prop}'`,
        });
      });
    });
  });

  describe('validate templating document', () => {
    it('happy path', () => {
      const doc = {
        doc: [
          {
            type: 'markdown',
            content: [{ type: 'text', text: 'hello' }],
          },
        ],
      };

      const validation = validator.validateTplfaDocument(doc);

      expect(validation).toEqual({
        ok: true,
        result: doc,
      });
    });
  });
});
