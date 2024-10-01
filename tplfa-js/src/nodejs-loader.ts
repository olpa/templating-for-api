import path from 'path';
import { promises as fs } from 'fs';
import { LoadedTemplate, LibTemplates } from './tplfa-types';

function getApisDir(): string {
  const rootFile = require.resolve('tplfa-apis/package.json');
  return path.dirname(rootFile);
}

export async function loadLibTemplates(): Promise<LibTemplates> {
  const apisDir = getApisDir();
  const files: Array<keyof LibTemplates> = ['openai-document-tpl.jsonnet', 'openai-request-tpl.jsonnet'];
  const loaded = files.map(async (fname) => [
    fname,
    await fs.readFile(path.join(apisDir, 'lib', fname), 'utf-8')
  ]);
  return Object.fromEntries(await Promise.all(loaded));
}

// Like `LoadedTemplate`, but `string` instead of `string|undefined`
export type DefinedLoadedTemplate = {
  requestTpl: string;
  documentTpl: string;
}

export async function loadTemplate(
  tname: string,
  libTemplates: LibTemplates
): Promise<DefinedLoadedTemplate> {
  const apisDir = getApisDir();
  const toLoad: Array<[keyof LoadedTemplate, string, keyof LibTemplates]> = [
    [ 'requestTpl', 'request-tpl.jsonnet', 'openai-request-tpl.jsonnet'],
    [ 'documentTpl', 'document-tpl.jsonnet', 'openai-document-tpl.jsonnet'],
  ]
  const loaded = toLoad.map(async ([field, fnameBase, libField]) => {
    const fname = path.join(apisDir, tname, 'lib', fnameBase);
    try {
      const code = await fs.readFile(fname, 'utf-8');
      return [field, code];
    } catch (err) {
      const code: string = (err as Error & { code: string })['code'];
      if (code !== 'ENOENT') {
        throw err;
      }
      return [field, libTemplates[libField]]
    }
  });
  return Object.fromEntries(await Promise.all(loaded));
}
