export type TplfaReqVars = {
    prompt: string;
    secret1: string;
    secret2: string;
    parent: string;
};
export type TplfaDocVars = {
    response: string;
    parent: string;
};
export type TplfaTransformationVars = {
    secret1: string;
    secret2: string;
    templatePath: string;
};
export type TplfaRequest = Record<string, unknown> & {
    url: string;
    method: string;
    body: Record<string, unknown>;
    headers?: Record<string, string>;
    browsingTopics?: boolean;
    keepalive?: boolean;
};
export type TplfaDocument = {
    doc: TplfaTopLevelNode[];
};
export type TplfaTopLevelNode = TplfaMarkdownNode;
export type TplfaMarkdownNode = {
    type: 'markdown';
    content: TplfaTextNode[];
};
export type TplfaTextNode = {
    type: 'text';
    text: string;
};
export type TplfaResultOrError<T> = {
    ok: true;
    result: T;
    warnings?: string[];
} | {
    ok: false;
    error: string;
    details?: string | Record<string, unknown>;
};
export type LoadedTemplate = {
    requestTpl: string | undefined;
    documentTpl: string | undefined;
    hasDebugFlag?: boolean | undefined;
};
export type LibTemplates = {
    'openai-document-tpl.jsonnet': string;
    'openai-request-tpl.jsonnet': string;
};
