import { LibTemplates } from './tplfa-types';
export declare function getApisDir(): string;
export declare function loadLibTemplates(): Promise<LibTemplates>;
export type DefinedLoadedTemplate = {
    requestTpl: string;
    documentTpl: string;
};
export declare function loadTemplate(tplPath: string, libTemplates: LibTemplates): Promise<DefinedLoadedTemplate>;
