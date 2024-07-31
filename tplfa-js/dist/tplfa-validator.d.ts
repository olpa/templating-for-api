import { TplfaRequest, TplfaDocument, TplfaResultOrError } from './tplfa-types';
export declare class TplfaValidator {
    private readonly ajv;
    private readonly request;
    private readonly document;
    constructor();
    private validate;
    validateTplfaRequest(request: unknown): TplfaResultOrError<TplfaRequest>;
    validateTplfaDocument(request: unknown): TplfaResultOrError<TplfaDocument>;
}
