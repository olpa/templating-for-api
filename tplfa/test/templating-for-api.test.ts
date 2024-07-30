import fs from 'fs';
import { getJsonnet, Jsonnet } from 'tplfa-jsonnet/jsonnet';
import sampleChatResponse from 'tplfa-apis/openai/fixture/response.json';
import sampleDocument from 'tplfa-apis/openai/fixture/document.json';
import { TemplatingForApi } from '../src/templating-for-api';
import { TplfaDocVars, TplfaReqVars } from '../src/tplfa-types';
require('tplfa-jsonnet/wasm_exec.js');

describe('templating-for-api', () => {
  let jsonnet: Jsonnet;
  let tplfa: TemplatingForApi;

  const openaiReqTemplate = fs.readFileSync(require.resolve('tplfa-apis/openai/lib/request-tpl.jsonnet'), 'utf-8');
  const openaiDocTemplate = fs.readFileSync(require.resolve('tplfa-apis/openai/lib/document-tpl.jsonnet'), 'utf-8');

  beforeAll(async () => {
    const jnWasm = fs.readFileSync(
      require.resolve('tplfa-jsonnet/libjsonnet.wasm')
    );
    jsonnet = await getJsonnet(jnWasm);
    tplfa = new TemplatingForApi(jsonnet);
  });

  describe('toRequest', () => {
    const vars: TplfaReqVars = {
      secret1: 'secret1',
      secret2: 'secret2',
      prompt: 'prompt',
      parent: '',
    };

    it('happy path', async () => {
      const tplfaRequest = await tplfa.toTplfaRequest(
        'test code',
        openaiReqTemplate,
        vars
      );

      expect(tplfaRequest.ok).toBe(true);
      if (!tplfaRequest.ok) {
        throw new Error('should be ok');
      }
      const request = TemplatingForApi.toRequest(tplfaRequest.result);
      expect(request.headers.get('Authorization')).toBe(
        'Bearer secret1'
      );
    });

    it('catch error in jsonnet', async () => {
      const request = await tplfa.toTplfaRequest(
        'test code',
        openaiReqTemplate,
        {} as TplfaReqVars
      );

      expect(request.ok).toBe(false);
      if (request.ok) {
        throw new Error('should not be ok');
      }
      expect(request.error).toContain(
        'Templated to request: test code: Failed to execute'
      );
      expect(request.error).toContain('Undefined external variable');
    });

    it('validate the request object', async () => {
      const request = await tplfa.toTplfaRequest(
        'test code',
        '{ "bad": true }',
        vars
      );

      expect(request.ok).toBe(false);
      if (request.ok) {
        throw new Error('should not be ok');
      }
      expect(request.error).toContain(
        'Templated to request: test code: Bad "Request" object'
      );
      const detailsRec = request.details as Record<string, unknown>;
      expect(detailsRec.validation).toContain(
        "data must have required property 'url'"
      );
      expect(JSON.parse(detailsRec.reqStr as string)).toEqual({
        bad: true,
      });
    });

    it('debug log transformations', async () => {
      const logMock = jest.fn();
      await tplfa.toTplfaRequest(
        'test code',
        openaiReqTemplate,
        vars,
        logMock
      );

      expect(logMock).toHaveBeenCalledTimes(2);
      expect(logMock).toHaveBeenNthCalledWith(
        1,
        'tplfa toRequest input [name, vars, code]',
        'test code',
        vars,
        openaiReqTemplate
      );
      expect(logMock).toHaveBeenNthCalledWith(
        2,
        'tplfa toRequest output [name, output]',
        'test code',
        expect.stringContaining('Bearer') &&
          expect.stringContaining('prompt')
      );
    });
  });

  describe('toDocument', () => {
    const vars: TplfaDocVars = {
      parent: '',
      response: JSON.stringify(sampleChatResponse),
    };

    it('happy path', async () => {
      const doc = await tplfa.toDocument(
        'test code',
        openaiDocTemplate,
        vars
      );

      expect(doc.ok).toBe(true);
      if (!doc.ok) {
        throw new Error('should be ok');
      }
      expect(doc.result).toEqual(sampleDocument);
    });

    it('catch error in jsonnet', async () => {
      const request = await tplfa.toDocument(
        'test code',
        openaiReqTemplate,
        {} as TplfaDocVars
      );

      expect(request.ok).toBe(false);
      if (request.ok) {
        throw new Error('should not be ok');
      }
      expect(request.error).toContain(
        'Templated to document: test code: Failed to execute'
      );
      expect(request.error).toContain(
        'Undefined external variable: prompt'
      );
    });

    it('validate the document object', async () => {
      const request = await tplfa.toDocument(
        'test code',
        '{ "bad": true }',
        vars
      );

      expect(request.ok).toBe(false);
      if (request.ok) {
        throw new Error('should not be ok');
      }
      expect(request.error).toEqual(
        'Templated to document: test code: Bad "Document" object'
      );
      const detailsRec = request.details as Record<string, unknown>;
      expect(detailsRec.validation).toContain(
        "data must have required property 'doc'"
      );
      expect(JSON.parse(detailsRec.transformed as string)).toEqual({
        bad: true,
      });
    });

    it('debug log transformations', async () => {
      const logMock = jest.fn();
      await tplfa.toDocument(
        'test code',
        openaiDocTemplate,
        vars,
        logMock
      );

      expect(logMock).toHaveBeenCalledTimes(2);
      expect(logMock).toHaveBeenNthCalledWith(
        1,
        'tplfa toDocument input [name, vars, code]',
        'test code',
        vars,
        openaiDocTemplate
      );
      expect(logMock).toHaveBeenNthCalledWith(
        2,
        'tplfa toDocument output [name, output]',
        'test code',
        expect.stringContaining(sampleDocument.doc[0].content[0].text)
      );
    });
  });
});