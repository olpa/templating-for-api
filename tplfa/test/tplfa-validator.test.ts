import { TplfaValidator } from '../src/tplfa-validator';

describe('tplfa validator', () => {
  const validator = new TplfaValidator();

  describe('validate templating request', () => {
    it('happy path', () => {
      const request = {
        url: 'http://example.com',
        method: 'POST',
        body: { foo: 'bar' },
        headers: { 'Content-Type': 'application/json' },
      };

      const validation = validator.validateTplfaRequest(request);

      expect(validation).toEqual({
        ok: true,
        result: request,
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
