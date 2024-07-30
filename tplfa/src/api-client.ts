import {
  ITemplatingForApi,
  TemplatingForApi,
} from './templating-for-api';
import {
  TplfaDocument,
  TplfaResultOrError,
  TplfaTransformationVars,
  LoadedTemplate,
} from './tplfa-types';
import { HttpClient } from './tplfa-http-client';

function findLast<T>(
  arr: T[],
  predP: (item: T) => boolean
): T | undefined {
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    const elem = arr[i];
    if (predP(elem)) {
      return elem;
    }
  }
  return undefined;
}

function findSecrets(transformationChain: TplfaTransformationVars[]): {
  secret1: string;
  secret2: string;
} {
  const secret1 = findLast(
    transformationChain.map((step) => step.secret1),
    Boolean
  );
  const secret2 = findLast(
    transformationChain.map((step) => step.secret2),
    Boolean
  );
  return { secret1: secret1 ?? '', secret2: secret2 ?? '' };
}

// To find `std.extVar('parent')`
const reIsPatchTemplate = /std\.extVar\s*\(s*['"]parent['"]s*\)s*/;

function isPatchTemplate(code: string): boolean {
  return reIsPatchTemplate.test(code);
}

type TrackedTemplate = LoadedTemplate & {
  templatePath: string;
  isPatchForRequest: boolean;
  isPatchForDocument: boolean;
};

async function loadTemplatesRev(
  transformationChain: TplfaTransformationVars[],
  loader: (
    templatePath: string
  ) => Promise<TplfaResultOrError<LoadedTemplate>>,
  logFunc: (...msg: unknown[]) => void
): Promise<TplfaResultOrError<TrackedTemplate[]>> {
  const templates: TrackedTemplate[] = [];
  for (let i = transformationChain.length - 1; i >= 0; i -= 1) {
    const { templatePath } = transformationChain[i];
    // eslint-disable-next-line no-await-in-loop
    const template = await loader(templatePath);
    if (!template.ok) {
      return {
        ...template,
        error: `Template '${templatePath}': Error from the loader: ${template.error}`,
      };
    }
    template.warnings?.forEach((w) =>
      logFunc(
        `Template '${templatePath}': Warning from the loader: ${w}`
      )
    );

    const { requestTpl, documentTpl } = template.result;
    templates.push({
      ...template.result,
      templatePath,
      isPatchForRequest: requestTpl
        ? isPatchTemplate(requestTpl)
        : false,
      isPatchForDocument: documentTpl
        ? isPatchTemplate(documentTpl)
        : false,
    });
  }
  return { ok: true, result: templates };
}

async function doTransformChain<VARS, OUT>(
  transform: (
    codeName: string,
    template: string,
    vars: VARS,
    debugLog?: (...msg: unknown[]) => void | undefined
  ) => Promise<TplfaResultOrError<OUT>>,
  tplType: string,
  baseVars: VARS,
  tpls: TrackedTemplate[],
  templateToJsonnetCode: (tpl: TrackedTemplate) => {
    templatePath: string;
    jsonnetCode: string | undefined;
    isPatch: boolean;
  },
  logFunc: (...msg: unknown[]) => void
): Promise<TplfaResultOrError<OUT>> {
  async function doTransformStep(
    i: number
  ): Promise<TplfaResultOrError<OUT>> {
    if (i >= tpls.length) {
      return {
        ok: false,
        error: `No base '${tplType}' template`,
      };
    }
    const template = tpls[i];
    const { templatePath, jsonnetCode, isPatch } =
      templateToJsonnetCode(template);
    if (!templatePath || !jsonnetCode) {
      return doTransformStep(i + 1);
    }
    const parentTplfa = isPatch
      ? await doTransformStep(i + 1)
      : undefined;
    if (parentTplfa !== undefined && !parentTplfa.ok) {
      return parentTplfa;
    }
    const parent = JSON.stringify(parentTplfa?.result) ?? '';
    const tplfaVars: VARS = {
      ...baseVars,
      parent,
    };
    const transformed = await transform(
      template.templatePath,
      jsonnetCode,
      tplfaVars,
      template.hasDebugFlag ? logFunc : undefined
    );
    if (!transformed.ok) {
      return {
        ok: false,
        error: `Error transforming to '${tplType}' using the template '${templatePath}': ${transformed.error}`,
      };
    }
    return transformed;
  }

  return doTransformStep(0);
}

export class ApiClient {
  constructor(
    private fetchFunc: typeof fetch,
    private tplfa: ITemplatingForApi,
    private loader: (
      templatePath: string
    ) => Promise<TplfaResultOrError<LoadedTemplate>>,
    private logFunc: (...msg: unknown[]) => void
  ) {}

  public async call(
    transformationChain: TplfaTransformationVars[],
    prompt: string
  ): Promise<TplfaResultOrError<TplfaDocument>> {
    const { secret1, secret2 } = findSecrets(transformationChain);

    const templates = await loadTemplatesRev(
      transformationChain,
      this.loader,
      this.logFunc
    );
    if (!templates.ok) {
      return templates;
    }

    const request = await doTransformChain(
      this.tplfa.toTplfaRequest.bind(this.tplfa),
      'Request',
      {
        prompt,
        secret1,
        secret2,
        parent: '',
      },
      templates.result,
      (tpl: TrackedTemplate) => ({
        templatePath: tpl.templatePath,
        jsonnetCode: tpl.requestTpl,
        isPatch: tpl.isPatchForRequest,
      }),
      this.logFunc
    );
    if (!request.ok) {
      return request;
    }

    const httpRequest = TemplatingForApi.toRequest(request.result);
    const resp = await HttpClient.query(httpRequest, this.fetchFunc);
    if (!resp.ok) {
      return resp;
    }

    const doc = await doTransformChain(
      this.tplfa.toDocument.bind(this.tplfa),
      'Document',
      {
        response: resp.result,
        parent: '',
      },
      templates.result,
      (tpl: TrackedTemplate) => ({
        templatePath: tpl.templatePath,
        jsonnetCode: tpl.documentTpl,
        isPatch: tpl.isPatchForDocument,
      }),
      this.logFunc
    );

    return doc;
  }
}
