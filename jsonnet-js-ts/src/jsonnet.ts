export type Jsonnet = {
  jsonnet_evaluate_snippet: (
    filename: string,
    code: string,
    files: Record<string, string>,
    extrStrs: Record<string, string>,
    extrCodes: Record<string, string>,
    tlaStrs: Record<string, string>,
    tlaCodes: Record<string, string>
  ) => Promise<string>;

  evaluate: (
    code: string,
    extrStrs?: Record<string, string>
  ) => Promise<string>;
};

let jsonnet: Jsonnet | undefined;
declare class Go {
  run: (wasm: WebAssembly.Module) => void;

  importObject: WebAssembly.Imports;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
declare let jsonnet_evaluate_snippet:
  | Jsonnet['jsonnet_evaluate_snippet']
  | undefined;

export async function getJsonnet(
  jnWasm: Promise<Response> | BufferSource
): Promise<Jsonnet> {
  if (jsonnet) {
    return jsonnet;
  }

  const go = new Go();
  const jnModule = await (jnWasm instanceof Promise
    ? WebAssembly.instantiateStreaming(jnWasm, go.importObject)
    : WebAssembly.instantiate(jnWasm, go.importObject));
  go.run(jnModule.instance);

  if (!jsonnet_evaluate_snippet) {
    throw new Error(
      'libjsonnet: `jsonnet_evaluate_snippet` is missing'
    );
  }

  async function evaluate(
    code: string,
    vars?: Record<string, string>
  ): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return jsonnet_evaluate_snippet!(
      'anonymous',
      code,
      { anonymous: code },
      vars ?? {},
      {},
      {},
      {}
    );
  }

  jsonnet = {
    jsonnet_evaluate_snippet,
    evaluate,
  };
  return jsonnet;
}
