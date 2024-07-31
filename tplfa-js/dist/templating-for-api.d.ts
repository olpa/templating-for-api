import type { Jsonnet } from 'tplfa-jsonnet/jsonnet';
import { TplfaDocument, TplfaDocVars, TplfaRequest, TplfaReqVars, TplfaResultOrError } from './tplfa-types';
import { TplfaValidator } from './tplfa-validator';
export interface ITemplatingForApi {
    toTplfaRequest(codeName: string, requestTemplate: string, reqVars: TplfaReqVars, debugLog?: (...msg: unknown[]) => void): Promise<TplfaResultOrError<TplfaRequest>>;
    toDocument(codeName: string, apiTemplate: string, docVars: TplfaDocVars, debugLog?: (...msg: unknown[]) => void): Promise<TplfaResultOrError<TplfaDocument>>;
}
export declare class TemplatingForApi implements ITemplatingForApi {
    private readonly jsonnet;
    private readonly validator;
    constructor(jsonnet: Jsonnet, validator?: TplfaValidator);
    toTplfaRequest(codeName: string, requestTemplate: string, reqVars: TplfaReqVars, debugLog?: (...msg: unknown[]) => void): Promise<TplfaResultOrError<TplfaRequest>>;
    static toRequest(req: TplfaRequest): Request;
    toDocument(codeName: string, apiTemplate: string, docVars: TplfaDocVars, debugLog?: (...msg: unknown[]) => void): Promise<TplfaResultOrError<TplfaDocument>>;
}
