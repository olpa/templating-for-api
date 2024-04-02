import fs from 'fs';
import '../dist/wasm_exec.js';

export type Jsonnet = {
  evaluate: (
    filename: string,
    code: string,
    files: Record<string, string>,
    extrStrs: Record<string, string>,
    extrCodes: Record<string, string>,
    tlaStrs: Record<string, string>,
    tlaCodes: Record<string, string>,
  ) => Promise<string>;
};

let jsonnet: Jsonnet | undefined;
declare const Go: any;
declare let jsonnet_evaluate_snippet: Jsonnet['evaluate'] | undefined;

export async function getJsonnet(): Promise<Jsonnet> {
  if (jsonnet) {
    return jsonnet;
  }

  const go = new Go();
  const jnWasm = fs.readFileSync(`${__dirname}/../dist/libjsonnet.wasm`);
  const jnModule = await WebAssembly.instantiate(jnWasm, go.importObject);
  go.run(jnModule.instance);

  if (!jsonnet_evaluate_snippet) {
    throw new Error('libjsonnet: `jsonnet_evaluate_snippet` is missing');
  }

  jsonnet = {
    evaluate: jsonnet_evaluate_snippet,
  }
  return jsonnet;
}
