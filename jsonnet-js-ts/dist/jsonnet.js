"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJsonnet = void 0;
let jsonnet;
async function getJsonnet(jnWasm) {
    if (jsonnet) {
        return jsonnet;
    }
    const go = new Go();
    const jnModule = await (jnWasm instanceof Promise
        ? WebAssembly.instantiateStreaming(jnWasm, go.importObject)
        : WebAssembly.instantiate(jnWasm, go.importObject));
    go.run(jnModule.instance);
    if (!jsonnet_evaluate_snippet) {
        throw new Error('libjsonnet: `jsonnet_evaluate_snippet` is missing');
    }
    async function evaluate(code, vars) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return jsonnet_evaluate_snippet('anonymous', code, { anonymous: code }, vars !== null && vars !== void 0 ? vars : {}, {}, {}, {});
    }
    jsonnet = {
        jsonnet_evaluate_snippet,
        evaluate,
    };
    return jsonnet;
}
exports.getJsonnet = getJsonnet;
