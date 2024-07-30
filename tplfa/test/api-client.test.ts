import FetchMock, { FetchMockSandbox } from 'fetch-mock';
import { ApiClient } from '../src/api-client';
import { ITemplatingForApi } from '../src/templating-for-api';
import {
  TplfaDocVars,
  TplfaDocument,
  TplfaReqVars,
  TplfaRequest,
  TplfaResultOrError,
  TplfaTransformationVars,
  LoadedTemplate
} from '../src/tplfa-types';

function getTestFetchMock(): FetchMockSandbox {
  const fetchMock = FetchMock.sandbox();
  // https://github.com/wheresrhys/fetch-mock/issues/598
  Object.assign(fetchMock.config, {
    Headers,
    Request,
    Response,
    fetch,
  });
  return fetchMock;
}

const hwDoc: TplfaDocument = {
  doc: [
    {
      type: 'markdown',
      content: [
        {
          type: 'text',
          text: 'Hello, world!',
        },
      ],
    },
  ],
};

class AllgoodTemplating implements ITemplatingForApi {
  toRequstArgs = jest.fn();

  toDocumentArgs = jest.fn();

  async toTplfaRequest(
    codeName: string,
    ...rest: unknown[]
  ): Promise<TplfaResultOrError<TplfaRequest>> {
    this.toRequstArgs(codeName, ...rest);
    if (codeName.includes('bad-request')) {
      return {
        ok: false,
        error: 'Test transformation error',
      };
    }
    return {
      ok: true,
      result: {
        url: `http://api-client.test.ts/${codeName}`,
        method: 'GET',
        body: {},
      },
    };
  }

  async toDocument(
    codeName: string,
    ...rest: unknown[]
  ): Promise<TplfaResultOrError<TplfaDocument>> {
    this.toDocumentArgs(codeName, ...rest);
    if (codeName.includes('bad-document')) {
      return {
        ok: false,
        error: 'Test transformation error',
      };
    }
    return { ok: true, result: hwDoc };
  }
}

async function loader(
  templatePath: string
): Promise<TplfaResultOrError<LoadedTemplate>> {
  if (templatePath.includes('empty')) {
    return {
      ok: true,
      warnings: [],
      result: {
        requestTpl: '',
        documentTpl: '',
      },
    };
  }
  if (templatePath.includes('error')) {
    return {
      ok: false,
      error: 'Test error from the loader',
    };
  }
  const patchMarker = templatePath.includes('patch')
    ? 'std.extVar("parent"); '
    : '';
  const warnings = templatePath.includes('warning')
    ? ['Test warning1 from the loader', 'Test warning2 from the loader']
    : [];
  return {
    ok: true,
    warnings,
    result: {
      requestTpl: `${patchMarker}{"requestTemplate": "${templatePath}"}`,
      documentTpl: `${patchMarker}{"documentTemplate": "${templatePath}"}`,
      hasDebugFlag: templatePath.includes('debug'),
    },
  };
}

describe('api-client', () => {
  const fetchMock = getTestFetchMock();
  let tplfaSpyReq: jest.SpyInstance | undefined;
  let tplfaSpyDoc: jest.SpyInstance | undefined;
  const logFunc = jest.fn();
  const noDebugLog = undefined;
  const tplfa = new AllgoodTemplating();
  const apiClient = new ApiClient(
    fetchMock as typeof fetch,
    tplfa,
    loader,
    logFunc
  );

  beforeEach(() => {
    fetchMock.get(
      'begin:http://api-client.test.ts/',
      {
        status: 200,
        body: 'api-client.test.ts body',
      },
      { overwriteRoutes: true }
    );
    tplfaSpyReq = jest.spyOn(tplfa, 'toTplfaRequest');
    tplfaSpyDoc = jest.spyOn(tplfa, 'toDocument');
  });

  afterEach(() => {
    fetchMock.resetHistory();
    tplfaSpyReq?.mockRestore();
    tplfaSpyDoc?.mockRestore();
  });

  it('happy path', async () => {
    const trVar = {
      secret1: 'secret1',
      secret2: 'secret2',
      templatePath: 'api-client.test.ts template',
    };

    //
    // Act
    //
    const doc = await apiClient?.call([trVar], 'prompt');

    //
    // Assert
    //

    // Pass vars to the transformation for "Request"
    expect(tplfaSpyReq).toHaveBeenCalledWith(
      'api-client.test.ts template',
      '{"requestTemplate": "api-client.test.ts template"}',
      {
        parent: '',
        prompt: 'prompt',
        secret1: 'secret1',
        secret2: 'secret2',
      },
      noDebugLog
    );

    // Do the http call
    expect(fetchMock.calls()).toHaveLength(1);

    // Pass the http response to the transformation for "Document"
    expect(tplfaSpyDoc).toHaveBeenCalledWith(
      'api-client.test.ts template',
      '{"documentTemplate": "api-client.test.ts template"}',
      {
        parent: '',
        response: 'api-client.test.ts body',
      },
      noDebugLog
    );
    expect(doc).toEqual({
      ok: true,
      result: hwDoc,
    });
  });

  describe('priority of secrets', () => {
    it('should use the last secrets if defined', async () => {
      const var1 = {
        secret1: 'defined secret1',
        secret2: 'shadowed secret2',
        templatePath: 'some',
      };
      const var2 = {
        secret1: '',
        secret2: 'defined secret2',
        templatePath: 'some',
      };

      const back = await apiClient?.call([var1, var2], 'prompt');
      expect(back.ok).toBeTruthy();

      expect(tplfaSpyReq).toHaveBeenCalledWith(
        'some',
        '{"requestTemplate": "some"}',
        {
          parent: '',
          prompt: 'prompt',
          secret1: 'defined secret1',
          secret2: 'defined secret2',
        },
        noDebugLog
      );
    });
  });

  describe('loader', () => {
    it('use the loader', async () => {
      const loaderSpy = jest.fn(loader);
      const apiClient2 = new ApiClient(
        fetchMock as typeof fetch,
        tplfa,
        loaderSpy,
        logFunc
      );
      const v1 = { templatePath: 'base', secret1: '', secret2: '' };
      const v2 = { templatePath: 'patch1', secret1: '', secret2: '' };
      const v3 = { templatePath: 'patch2', secret1: '', secret2: '' };

      const back = await apiClient2?.call([v1, v2, v3], 'prompt');
      expect(back.ok).toBeTruthy();

      expect(loaderSpy).toHaveBeenCalledTimes(3);
      ['base', 'patch1', 'patch2'].forEach((name) =>
        expect(loaderSpy).toHaveBeenCalledWith(name)
      );
    });

    it('stop on a loader error', async () => {
      const v1 = { templatePath: 'error', secret1: '', secret2: '' };
      const v2 = { templatePath: 'base', secret1: '', secret2: '' };

      const back = await apiClient.call([v1, v2], 'prompt');

      expect(back).toEqual({
        ok: false,
        error:
          "Template 'error': Error from the loader: Test error from the loader",
      });
      expect(tplfaSpyReq).not.toHaveBeenCalled();
      expect(tplfaSpyDoc).not.toHaveBeenCalled();
    });
  });

  function stepVars(templatePath: string): TplfaTransformationVars {
    return {
      templatePath,
      secret1: '',
      secret2: '',
    };
  }

  describe('chaining for `toRequest`', () => {
    function parentFill(expectedParent: string): string {
      const tplfaReq: TplfaRequest = {
        url: `http://api-client.test.ts/${expectedParent}`,
        method: 'GET',
        body: {},
      };
      return JSON.stringify(tplfaReq);
    }

    const expectedReqVars: TplfaReqVars = {
      parent: '',
      prompt: 'prompt',
      secret1: '',
      secret2: '',
    };

    it('happy path: base template and two patches', async () => {
      const v1 = stepVars('base');
      const v2 = stepVars('patch1');
      const v3 = stepVars('patch2');

      const back = await apiClient?.call([v1, v2, v3], 'prompt');
      expect(back.ok).toBeTruthy();

      expect(tplfaSpyReq).toHaveBeenCalledTimes(3);
      expect(tplfaSpyReq).toHaveBeenNthCalledWith(
        1,
        'base',
        '{"requestTemplate": "base"}',
        expectedReqVars,
        noDebugLog
      );
      expect(tplfaSpyReq).toHaveBeenNthCalledWith(
        2,
        'patch1',
        'std.extVar("parent"); {"requestTemplate": "patch1"}',
        {
          ...expectedReqVars,
          parent: parentFill('base'),
        },
        noDebugLog
      );
      expect(tplfaSpyReq).toHaveBeenNthCalledWith(
        3,
        'patch2',
        'std.extVar("parent"); {"requestTemplate": "patch2"}',
        {
          ...expectedReqVars,
          parent: parentFill('patch1'),
        },
        noDebugLog
      );
    });

    it('skip step if template name is not defined', async () => {
      const emptyTemplatePath = '';
      const v1 = stepVars('base');
      const v2 = stepVars(emptyTemplatePath);
      const v3 = stepVars('patch2');

      const back = await apiClient?.call([v1, v2, v3], 'prompt');
      expect(back.ok).toBeTruthy();

      expect(tplfaSpyReq).toHaveBeenCalledTimes(2);
      expect(tplfaSpyReq).toHaveBeenNthCalledWith(
        1,
        'base',
        '{"requestTemplate": "base"}',
        expectedReqVars,
        noDebugLog
      );
      expect(tplfaSpyReq).toHaveBeenNthCalledWith(
        2,
        'patch2',
        'std.extVar("parent"); {"requestTemplate": "patch2"}',
        {
          ...expectedReqVars,
          parent: parentFill('base'),
        },
        noDebugLog
      );
    });

    it('skip empty templates', async () => {
      const v1 = stepVars('base');
      const v2 = stepVars('empty');
      const v3 = stepVars('patch2');

      const back = await apiClient?.call([v1, v2, v3], 'prompt');
      expect(back.ok).toBeTruthy();

      expect(tplfaSpyReq).toHaveBeenCalledTimes(2);
      expect(tplfaSpyReq).toHaveBeenNthCalledWith(
        1,
        'base',
        '{"requestTemplate": "base"}',
        expectedReqVars,
        noDebugLog
      );
      expect(tplfaSpyReq).toHaveBeenNthCalledWith(
        2,
        'patch2',
        'std.extVar("parent"); {"requestTemplate": "patch2"}',
        {
          ...expectedReqVars,
          parent: parentFill('base'),
        },
        noDebugLog
      );
    });

    it('stop chaining if not a patch', async () => {
      const v1 = stepVars('base');
      const v2 = stepVars('patch1');
      const v3 = stepVars('base');

      const back = await apiClient?.call([v1, v2, v3], 'prompt');
      expect(back.ok).toBeTruthy();

      expect(tplfaSpyReq).toHaveBeenCalledTimes(1);
      expect(tplfaSpyReq).toHaveBeenCalledWith(
        'base',
        '{"requestTemplate": "base"}',
        expectedReqVars,
        noDebugLog
      );
    });

    it('stop chaining on a transformation error', async () => {
      const v1 = stepVars('base');
      const v2 = stepVars('patch1-bad-request-template');
      const v3 = stepVars('patch2');

      const back = await apiClient?.call([v1, v2, v3], 'prompt');

      expect(back).toEqual({
        ok: false,
        error:
          "Error transforming to 'Request' using the template 'patch1-bad-request-template': Test transformation error",
      });
      expect(tplfaSpyReq).toHaveBeenCalledTimes(2); // not 3
    });

    it('reject patch-only chain without a base', async () => {
      const v1 = stepVars('patch1');
      const v2 = stepVars('patch2');

      const back = await apiClient?.call([v1, v2], 'prompt');

      expect(back).toEqual({
        ok: false,
        error: "No base 'Request' template",
      });
    });
  });

  describe('chaining for `toDocument`', () => {
    const expectedDocVars: TplfaDocVars = {
      response: 'api-client.test.ts body',
      parent: '',
    };

    it('happy path: base template and two patches', async () => {
      const v1 = stepVars('base');
      const v2 = stepVars('patch1');
      const v3 = stepVars('patch2');

      const back = await apiClient?.call([v1, v2, v3], 'prompt');
      expect(back.ok).toBeTruthy();

      expect(tplfaSpyDoc).toHaveBeenCalledTimes(3);
      expect(tplfaSpyDoc).toHaveBeenNthCalledWith(
        1,
        'base',
        '{"documentTemplate": "base"}',
        expectedDocVars,
        noDebugLog
      );
      expect(tplfaSpyDoc).toHaveBeenNthCalledWith(
        2,
        'patch1',
        'std.extVar("parent"); {"documentTemplate": "patch1"}',
        {
          ...expectedDocVars,
          parent: JSON.stringify(hwDoc),
        },
        noDebugLog
      );
      expect(tplfaSpyDoc).toHaveBeenNthCalledWith(
        3,
        'patch2',
        'std.extVar("parent"); {"documentTemplate": "patch2"}',
        {
          ...expectedDocVars,
          parent: JSON.stringify(hwDoc),
        },
        noDebugLog
      );
    });

    it('skip step if template name is not defined', async () => {
      const emptyTemplatePath = '';
      const v1 = stepVars('base');
      const v2 = stepVars(emptyTemplatePath);
      const v3 = stepVars('patch2');

      const back = await apiClient?.call([v1, v2, v3], 'prompt');
      expect(back.ok).toBeTruthy();

      expect(tplfaSpyDoc).toHaveBeenCalledTimes(2);
      expect(tplfaSpyDoc).toHaveBeenNthCalledWith(
        1,
        'base',
        '{"documentTemplate": "base"}',
        expectedDocVars,
        noDebugLog
      );
      expect(tplfaSpyDoc).toHaveBeenNthCalledWith(
        2,
        'patch2',
        'std.extVar("parent"); {"documentTemplate": "patch2"}',
        {
          ...expectedDocVars,
          parent: JSON.stringify(hwDoc),
        },
        noDebugLog
      );
    });

    it('skip empty templates', async () => {
      const v1 = stepVars('base');
      const v2 = stepVars('empty');
      const v3 = stepVars('patch2');

      const back = await apiClient?.call([v1, v2, v3], 'prompt');
      expect(back.ok).toBeTruthy();

      expect(tplfaSpyDoc).toHaveBeenCalledTimes(2);
      expect(tplfaSpyDoc).toHaveBeenNthCalledWith(
        1,
        'base',
        '{"documentTemplate": "base"}',
        expectedDocVars,
        noDebugLog
      );
      expect(tplfaSpyDoc).toHaveBeenNthCalledWith(
        2,
        'patch2',
        'std.extVar("parent"); {"documentTemplate": "patch2"}',
        {
          ...expectedDocVars,
          parent: JSON.stringify(hwDoc),
        },
        noDebugLog
      );
    });

    it('stop chaining if not a patch', async () => {
      const v1 = stepVars('base');
      const v2 = stepVars('patch1');
      const v3 = stepVars('base');

      const back = await apiClient?.call([v1, v2, v3], 'prompt');
      expect(back.ok).toBeTruthy();

      expect(tplfaSpyDoc).toHaveBeenCalledTimes(1);
      expect(tplfaSpyDoc).toHaveBeenCalledWith(
        'base',
        '{"documentTemplate": "base"}',
        expectedDocVars,
        noDebugLog
      );
    });

    it('stop chaining on a transformation error', async () => {
      const v1 = stepVars('base');
      const v2 = stepVars('patch1-bad-document-template');
      const v3 = stepVars('patch2');

      const back = await apiClient?.call([v1, v2, v3], 'prompt');

      expect(back).toEqual({
        ok: false,
        error:
          "Error transforming to 'Document' using the template 'patch1-bad-document-template': Test transformation error",
      });
      expect(tplfaSpyDoc).toHaveBeenCalledTimes(2); // not 3
    });

    // The effort doesn't worth it
    // it('reject patch-only chain without a base', async () => { });
  });

  it('pass the debug-flag to transformations', async () => {
    const fill = {
      secret1: 'secret1',
      secret2: 'secret2',
    };
    const loggerArgs = [
      expect.any(String),
      expect.any(String),
      expect.any(Object),
      expect.any(Function), // the log function as the debug flag
    ];

    // no debug logging
    tplfa.toRequstArgs.mockClear();
    tplfa.toDocumentArgs.mockClear();

    await apiClient?.call(
      [{ ...fill, templatePath: 'normal template' }],
      'prompt'
    );

    expect(tplfa.toRequstArgs).not.toHaveBeenCalledWith(...loggerArgs);
    expect(tplfa.toDocumentArgs).not.toHaveBeenCalledWith(
      ...loggerArgs
    );

    // with debug logging
    tplfa.toRequstArgs.mockClear();
    tplfa.toDocumentArgs.mockClear();

    await apiClient?.call(
      [{ ...fill, templatePath: 'debug template' }],
      'prompt'
    );

    expect(tplfa.toRequstArgs).toHaveBeenCalledWith(...loggerArgs);
    expect(tplfa.toDocumentArgs).toHaveBeenCalledWith(...loggerArgs);
  });

  it('log warnings', async () => {
    logFunc.mockClear();
    const v1 = {
      templatePath: 'base-with-warnings',
      secret1: '',
      secret2: '',
    };
    const v2 = { templatePath: 'patch', secret1: '', secret2: '' };

    const back = await apiClient.call([v1, v2], 'prompt');
    expect(back.ok).toBeTruthy();
    expect(logFunc).toHaveBeenCalledWith(
      "Template 'base-with-warnings': Warning from the loader: Test warning1 from the loader"
    );
    expect(logFunc).toHaveBeenCalledWith(
      "Template 'base-with-warnings': Warning from the loader: Test warning2 from the loader"
    );
  });
});
