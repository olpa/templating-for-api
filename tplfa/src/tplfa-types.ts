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

// The type of Record should be "<string, string>" but it's "<string, unknown>"
// because otherwise the type of "body", "headers" etc also should be string.
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

export type TplfaResultOrError<T> =
  | {
      ok: true;
      result: T;
      warnings?: string[];
    }
  | {
      ok: false;
      error: string;
      details?: string | Record<string, unknown>;
    };
