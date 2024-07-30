import Ajv, { ValidateFunction } from 'ajv';
import tplfaRequestSchema from 'tplfa-apis/schemas/tplfa-request.json';
import tplfaDocumentSchema from 'tplfa-apis/schemas/tplfa-document.json';
import {
  TplfaRequest,
  TplfaDocument,
  TplfaResultOrError,
} from './tplfa-types';

export class TplfaValidator {
  private readonly ajv: Ajv;

  private readonly request: ValidateFunction<TplfaRequest>;

  private readonly document: ValidateFunction<TplfaDocument>;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    this.request = this.ajv.compile(tplfaRequestSchema);
    this.document = this.ajv.compile(tplfaDocumentSchema);
  }

  private validate<T>(
    data: unknown,
    validateFunction: ValidateFunction<T>
  ): TplfaResultOrError<T> {
    const valid = validateFunction(data);
    if (valid) {
      return {
        ok: true,
        result: data,
      };
    }
    return {
      ok: false,
      error: this.ajv.errorsText(validateFunction.errors),
    };
  }

  public validateTplfaRequest(
    request: unknown
  ): TplfaResultOrError<TplfaRequest> {
    return this.validate(request, this.request);
  }

  public validateTplfaDocument(
    request: unknown
  ): TplfaResultOrError<TplfaDocument> {
    return this.validate(request, this.document);
  }
}
