export interface TplfaRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
};

export interface TplfaTextNode {
  type: 'text';
  text: string;
}

export interface TplfaMarkdownNode {
  type: 'markdown';
  content: TplfaTextNode[];
}

export interface TplfaDocument {
  doc: TplfaMarkdownNode[];
}
