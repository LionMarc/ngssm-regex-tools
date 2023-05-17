import { InjectionToken } from '@angular/core';

export interface NgssmRegexToolsConfig {
  regexControlDebounceTimeInMs: number;
}

export const getDefaultNgssmRegexToolsConfig = (): NgssmRegexToolsConfig => ({
  regexControlDebounceTimeInMs: 100
});

export const NGSSM_REGEX_TOOLS_CONFIG = new InjectionToken<NgssmRegexToolsConfig>('NGSSM_REGEX_TOOLS_CONFIG');
