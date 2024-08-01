"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatingForApi = void 0;
class TemplatingForApi {
    constructor(jsonnet, validator) {
        this.jsonnet = jsonnet;
        this.validator = validator;
    }
    async toTplfaRequest(codeName, requestTemplate, reqVars, debugLog) {
        let error;
        const errorPrefix = `Templated to request: ${codeName}`;
        const details = {
            codeName,
            requestTemplate,
            reqVars,
        };
        if (debugLog) {
            debugLog('tplfa toRequest input [name, vars, code]', codeName, reqVars, requestTemplate);
        }
        try {
            error = `${errorPrefix}: Failed to execute`;
            const reqStr = await this.jsonnet.evaluate(requestTemplate, reqVars);
            if (debugLog) {
                debugLog('tplfa toRequest output [name, output]', codeName, reqStr);
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
        }
        catch (e) {
            error = `${error}: ${e}`;
            if (e instanceof Error) {
                details.errorStack = e.stack;
            }
            return { ok: false, error, details };
        }
    }
    static toRequest(req) {
        const fetchParams = Object.assign(Object.assign({}, req), { url: undefined, body: JSON.stringify(req.body) });
        try {
            return new Request(req.url, fetchParams);
        }
        catch (e) {
            // Handle faulty whatwg-fetch: https://github.com/whatwg/fetch/issues/551
            if (req.method !== 'GET' && req.method !== 'HEAD') {
                throw e;
            }
            const bodyless = Object.assign(Object.assign({}, fetchParams), { body: undefined });
            return new Request(req.url, bodyless);
        }
    }
    async toDocument(codeName, apiTemplate, docVars, debugLog) {
        let error;
        const errorPrefix = `Templated to document: ${codeName}`;
        const details = {
            codeName,
            apiTemplate,
            docVars,
        };
        if (debugLog) {
            debugLog('tplfa toDocument input [name, vars, code]', codeName, docVars, apiTemplate);
        }
        try {
            error = `${errorPrefix}: Failed to execute`;
            const transformed = await this.jsonnet.evaluate(apiTemplate, docVars);
            if (debugLog) {
                debugLog('tplfa toDocument output [name, output]', codeName, transformed);
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
        }
        catch (e) {
            error = `${error}: ${e}`;
            if (e instanceof Error) {
                details.errorStack = e.stack;
            }
            return { ok: false, error, details };
        }
    }
}
exports.TemplatingForApi = TemplatingForApi;
