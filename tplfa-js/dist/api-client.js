"use strict";


const templating_for_api_1 = require("./templating-for-api");
const tplfa_http_client_1 = require("./tplfa-http-client");
function findLast(arr, predP) {
    for (let i = arr.length - 1; i >= 0; i -= 1) {
        const elem = arr[i];
        if (predP(elem)) {
            return elem;
        }
    }
    return undefined;
}
function findSecrets(transformationChain) {
    const secret1 = findLast(transformationChain.map((step) => step.secret1), Boolean);
    const secret2 = findLast(transformationChain.map((step) => step.secret2), Boolean);
    return { secret1: secret1 !== null && secret1 !== void 0 ? secret1 : '', secret2: secret2 !== null && secret2 !== void 0 ? secret2 : '' };
}
// To find `std.extVar('parent')`
const reIsPatchTemplate = /std\.extVar\s*\(s*['"]parent['"]s*\)s*/;
function isPatchTemplate(code) {
    return reIsPatchTemplate.test(code);
}
async function loadTemplatesRev(transformationChain, loader, logFunc) {
    var _a;
    const templates = [];
    for (let i = transformationChain.length - 1; i >= 0; i -= 1) {
        const { templatePath } = transformationChain[i];
        // eslint-disable-next-line no-await-in-loop
        const template = await loader(templatePath);
        if (!template.ok) {
            return Object.assign(Object.assign({}, template), { error: `Template '${templatePath}': Error from the loader: ${template.error}` });
        }
        (_a = template.warnings) === null || _a === void 0 ? void 0 : _a.forEach((w) => logFunc(`Template '${templatePath}': Warning from the loader: ${w}`));
        const { requestTpl, documentTpl } = template.result;
        templates.push(Object.assign(Object.assign({}, template.result), { templatePath, isPatchForRequest: requestTpl
                ? isPatchTemplate(requestTpl)
                : false, isPatchForDocument: documentTpl
                ? isPatchTemplate(documentTpl)
                : false }));
    }
    return { ok: true, result: templates };
}
async function doTransformChain(transform, tplType, baseVars, tpls, templateToJsonnetCode, logFunc) {
    async function doTransformStep(i) {
        var _a;
        if (i >= tpls.length) {
            return {
                ok: false,
                error: `No base '${tplType}' template`,
            };
        }
        const template = tpls[i];
        const { templatePath, jsonnetCode, isPatch } = templateToJsonnetCode(template);
        if (!templatePath || !jsonnetCode) {
            return doTransformStep(i + 1);
        }
        const parentTplfa = isPatch
            ? await doTransformStep(i + 1)
            : undefined;
        if (parentTplfa !== undefined && !parentTplfa.ok) {
            return parentTplfa;
        }
        const parent = (_a = JSON.stringify(parentTplfa === null || parentTplfa === void 0 ? void 0 : parentTplfa.result)) !== null && _a !== void 0 ? _a : '';
        const tplfaVars = Object.assign(Object.assign({}, baseVars), { parent });
        const transformed = await transform(template.templatePath, jsonnetCode, tplfaVars, template.hasDebugFlag ? logFunc : undefined);
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
class ApiClient {
    constructor(fetchFunc, tplfa, loader, logFunc) {
        this.fetchFunc = fetchFunc;
        this.tplfa = tplfa;
        this.loader = loader;
        this.logFunc = logFunc;
    }
    async call(transformationChain, prompt) {
        const { secret1, secret2 } = findSecrets(transformationChain);
        const templates = await loadTemplatesRev(transformationChain, this.loader, this.logFunc);
        if (!templates.ok) {
            return templates;
        }
        const request = await doTransformChain(this.tplfa.toTplfaRequest.bind(this.tplfa), 'Request', {
            prompt,
            secret1,
            secret2,
            parent: '',
        }, templates.result, (tpl) => ({
            templatePath: tpl.templatePath,
            jsonnetCode: tpl.requestTpl,
            isPatch: tpl.isPatchForRequest,
        }), this.logFunc);
        if (!request.ok) {
            return request;
        }
        const httpRequest = templating_for_api_1.TemplatingForApi.toRequest(request.result);
        const resp = await tplfa_http_client_1.HttpClient.query(httpRequest, this.fetchFunc);
        if (!resp.ok) {
            return resp;
        }
        const doc = await doTransformChain(this.tplfa.toDocument.bind(this.tplfa), 'Document', {
            response: resp.result,
            parent: '',
        }, templates.result, (tpl) => ({
            templatePath: tpl.templatePath,
            jsonnetCode: tpl.documentTpl,
            isPatch: tpl.isPatchForDocument,
        }), this.logFunc);
        return doc;
    }
}

