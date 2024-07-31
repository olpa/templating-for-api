import { ITemplatingForApi } from './templating-for-api';
import { TplfaDocument, TplfaResultOrError, TplfaTransformationVars, LoadedTemplate } from './tplfa-types';
export declare class ApiClient {
    private fetchFunc;
    private tplfa;
    private loader;
    private logFunc;
    constructor(fetchFunc: typeof fetch, tplfa: ITemplatingForApi, loader: (templatePath: string) => Promise<TplfaResultOrError<LoadedTemplate>>, logFunc: (...msg: unknown[]) => void);
    call(transformationChain: TplfaTransformationVars[], prompt: string): Promise<TplfaResultOrError<TplfaDocument>>;
}
