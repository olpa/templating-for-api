"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};


const ajv_1 = __importDefault(require("ajv"));
const tplfa_request_json_1 = __importDefault(require("tplfa-apis/schemas/tplfa-request.json"));
const tplfa_document_json_1 = __importDefault(require("tplfa-apis/schemas/tplfa-document.json"));
class TplfaValidator {
    constructor() {
        this.ajv = new ajv_1.default({ allErrors: true });
        this.request = this.ajv.compile(tplfa_request_json_1.default);
        this.document = this.ajv.compile(tplfa_document_json_1.default);
    }
    validate(data, validateFunction) {
        const valid = validateFunction(data);
        if (valid) {
            return {
                ok: true,
                result: data,
            };
        }
        return {
            ok: false,
            error: this.ajv.errorsText(validateFunction.errors),
        };
    }
    validateTplfaRequest(request) {
        return this.validate(request, this.request);
    }
    validateTplfaDocument(request) {
        return this.validate(request, this.document);
    }
}

