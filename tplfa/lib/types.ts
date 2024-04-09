export interface TplfaRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
};
