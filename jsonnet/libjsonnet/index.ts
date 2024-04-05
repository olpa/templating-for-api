import fs from 'fs';
import '../dist/wasm_exec.js';

export type Jsonnet = {
  jsonnet_evaluate_snippet: (
    filename: string,
    code: string,
    files: Record<string, string>,
    extrStrs: Record<string, string>,
    extrCodes: Record<string, string>,
    tlaStrs: Record<string, string>,
    tlaCodes: Record<string, string>,
  ) => Promise<string>;

  evaluate: (
    code: string,
    extrStrs?: Record<string, string>,
  ) => Promise<string>;
};

let jsonnet: Jsonnet | undefined;
declare const Go: any;
declare let jsonnet_evaluate_snippet: Jsonnet['jsonnet_evaluate_snippet'] | undefined;

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

  async function evaluate(
    code: string,
    vars?: Record<string, string>
  ): Promise<string> {
    return jsonnet_evaluate_snippet!(
      'anonymous',
      code,
      { anonymous: code },
      vars ?? {},
      {}, {}, {}
    );
  }

  jsonnet = {
    jsonnet_evaluate_snippet,
    evaluate,
  }
  return jsonnet;
}
