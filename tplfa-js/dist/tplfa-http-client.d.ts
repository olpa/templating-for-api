import { TplfaResultOrError } from './tplfa-types';
export declare class HttpClient {
    static query(request: Request, fetchFunc?: typeof fetch, errorLog?: typeof console.error): Promise<TplfaResultOrError<string>>;
}
