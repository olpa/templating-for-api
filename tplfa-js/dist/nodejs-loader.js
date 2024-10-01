"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadLibTemplates = loadLibTemplates;
exports.loadTemplate = loadTemplate;
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
function getApisDir() {
    const rootFile = require.resolve('tplfa-apis/package.json');
    return path_1.default.dirname(rootFile);
}
async function loadLibTemplates() {
    const apisDir = getApisDir();
    const files = [
        'openai-document-tpl.jsonnet',
        'openai-request-tpl.jsonnet',
    ];
    const loaded = files.map(async (fname) => [
        fname,
        await fs_1.promises.readFile(path_1.default.join(apisDir, 'lib', fname), 'utf-8'),
    ]);
    return Object.fromEntries(await Promise.all(loaded));
}
async function loadTemplate(tname, libTemplates) {
    const apisDir = getApisDir();
    const toLoad = [
        ['requestTpl', 'request-tpl.jsonnet', 'openai-request-tpl.jsonnet'],
        [
            'documentTpl',
            'document-tpl.jsonnet',
            'openai-document-tpl.jsonnet',
        ],
    ];
    const loaded = toLoad.map(async ([field, fnameBase, libField]) => {
        const fname = path_1.default.join(apisDir, tname, 'lib', fnameBase);
        try {
            const code = await fs_1.promises.readFile(fname, 'utf-8');
            return [field, code];
        }
        catch (err) {
            const { code } = err;
            if (code !== 'ENOENT') {
                throw err;
            }
            return [field, libTemplates[libField]];
        }
    });
    return Object.fromEntries(await Promise.all(loaded));
}
