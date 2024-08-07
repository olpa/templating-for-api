import { TplfaResultOrError } from './tplfa-types';

export class HttpClient {
  static async query(
    request: Request,
    fetchFunc: typeof fetch = fetch,
    // eslint-disable-next-line no-console
    errorLog: typeof console.error = console.error.bind(console)
  ): Promise<TplfaResultOrError<string>> {
    try {
      const resp = await fetchFunc(request);
      if (!resp.ok) {
        return {
          ok: false,
          error: `Non-2XX response: ${resp.status} ${resp.statusText}`,
          details: await resp.text(),
        };
      }
      return {
        ok: true,
        result: await resp.text(),
      };
    } catch (e) {
      errorLog('HttpClient.query error:', e);
      return {
        ok: false,
        error:
          e instanceof Error
            ? e.message
            : `Can not get json from a service`,
      };
    }
  }
}
