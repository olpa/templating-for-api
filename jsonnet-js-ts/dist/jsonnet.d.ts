export type Jsonnet = {
    jsonnet_evaluate_snippet: (filename: string, code: string, files: Record<string, string>, extrStrs: Record<string, string>, extrCodes: Record<string, string>, tlaStrs: Record<string, string>, tlaCodes: Record<string, string>) => Promise<string>;
    evaluate: (code: string, extrStrs?: Record<string, string>, files?: Record<string, string>) => Promise<string>;
};
export declare function getJsonnet(jnWasm: Promise<Response> | BufferSource): Promise<Jsonnet>;
