import { LibTemplates } from './tplfa-types';
export declare function loadLibTemplates(): Promise<LibTemplates>;
export type DefinedLoadedTemplate = {
    requestTpl: string;
    documentTpl: string;
};
export declare function loadTemplate(tname: string, libTemplates: LibTemplates): Promise<DefinedLoadedTemplate>;
