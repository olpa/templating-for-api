import type { Jsonnet } from 'tplfa-jsonnet/jsonnet';
import {
  TplfaDocument,
  TplfaDocVars,
  TplfaRequest,
  TplfaReqVars,
  TplfaResultOrError,
} from './tplfa-types';
import { TplfaValidator } from './tplfa-validator';

export interface ITemplatingForApi {
  toTplfaRequest(
    codeName: string,
    requestTemplate: string,
    reqVars: TplfaReqVars,
    debugLog?: (...msg: unknown[]) => void
  ): Promise<TplfaResultOrError<TplfaRequest>>;
  toDocument(
    codeName: string,
    apiTemplate: string,
    docVars: TplfaDocVars,
    debugLog?: (...msg: unknown[]) => void
  ): Promise<TplfaResultOrError<TplfaDocument>>;
}

export class TemplatingForApi implements ITemplatingForApi {
  constructor(
    private readonly jsonnet: Jsonnet,
    private readonly validator: TplfaValidator,
    private readonly jsonnetLibFiles: Record<string, string>,
  ) {}

  async toTplfaRequest(
    codeName: string,
    requestTemplate: string,
    reqVars: TplfaReqVars,
    debugLog?: (...msg: unknown[]) => void
  ): Promise<TplfaResultOrError<TplfaRequest>> {
    let error: string | undefined;
    const errorPrefix = `Templated to request: ${codeName}`;
    const details: Record<string, unknown> = {
      codeName,
      requestTemplate,
      reqVars,
    };

    if (debugLog) {
      debugLog(
        'tplfa toRequest input [name, vars, code]',
        codeName,
        reqVars,
        requestTemplate
      );
    }

    try {
      error = `${errorPrefix}: Failed to execute`;
      const reqStr = await this.jsonnet.evaluate(
        requestTemplate,
        reqVars,
        this.jsonnetLibFiles
      );

      if (debugLog) {
        debugLog(
          'tplfa toRequest output [name, output]',
          codeName,
          reqStr
        );
      }

      error = `${errorPrefix}: Non-json output`;
      details.reqStr = reqStr;
      const req = JSON.parse(reqStr);

      error = `${errorPrefix}: Bad "Request" object`;
      const validated = this.validator.validateTplfaRequest(req);
      if (!validated.ok) {
        details.validation = validated.error;
        return { ok: false, error, details };
      }

      return validated;
    } catch (e) {
      error = `${error}: ${e}`;
      if (e instanceof Error) {
        details.errorStack = e.stack;
      }
      return { ok: false, error, details };
    }
  }

  static toRequest(req: TplfaRequest): Request {
    const fetchParams = {
      ...req,
      url: undefined,
      body: JSON.stringify(req.body),
    };
    try {
      return new Request(req.url, fetchParams);
    } catch (e) {
      // Handle faulty whatwg-fetch: https://github.com/whatwg/fetch/issues/551
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        throw e;
      }
      const bodyless = { ...fetchParams, body: undefined };
      return new Request(req.url, bodyless);
    }
  }

  async toDocument(
    codeName: string,
    apiTemplate: string,
    docVars: TplfaDocVars,
    debugLog?: (...msg: unknown[]) => void
  ): Promise<TplfaResultOrError<TplfaDocument>> {
    let error: string | undefined;
    const errorPrefix = `Templated to document: ${codeName}`;
    const details: Record<string, unknown> = {
      codeName,
      apiTemplate,
      docVars,
    };

    if (debugLog) {
      debugLog(
        'tplfa toDocument input [name, vars, code]',
        codeName,
        docVars,
        apiTemplate
      );
    }

    try {
      error = `${errorPrefix}: Failed to execute`;
      const transformed = await this.jsonnet.evaluate(
        apiTemplate,
        docVars,
        this.jsonnetLibFiles
      );

      if (debugLog) {
        debugLog(
          'tplfa toDocument output [name, output]',
          codeName,
          transformed
        );
      }

      error = `${errorPrefix}: Non-json output`;
      details.transformed = transformed;
      const maybeDoc = JSON.parse(transformed);

      error = `${errorPrefix}: Bad "Document" object`;
      const validated = this.validator.validateTplfaDocument(maybeDoc);
      if (!validated.ok) {
        details.validation = validated.error;
        return { ok: false, error, details };
      }

      return validated;
    } catch (e) {
      error = `${error}: ${e}`;
      if (e instanceof Error) {
        details.errorStack = e.stack;
      }
      return { ok: false, error, details };
    }
  }
}
