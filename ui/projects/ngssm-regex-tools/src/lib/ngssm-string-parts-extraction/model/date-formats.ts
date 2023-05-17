import { InjectionToken } from '@angular/core';

export const NGSSM_REGEX_TOOLS_DATE_FORMATS = new InjectionToken<string[]>('NGSSM_REGEX_TOOLS_DATE_FORMATS');

export const getDefaultNgssmRegexToolsDateFormats = (): string[] => ['yyyy-MM-dd', 'dd/MM/yyyy', 'MM/dd/yyyy', 'yyyyMMdd'];
