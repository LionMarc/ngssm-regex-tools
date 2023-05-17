import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { stringPartsExtractionEffectProvider, stringPartsExtractorEditorEffectProvider } from './effects';
import { stringPartsExtractorEditorReducerProvider, stringPartsExtractorTestingReducerProvider } from './reducers';

export const provideNgssmStringPartsExtraction = (): EnvironmentProviders => {
  return makeEnvironmentProviders([
    stringPartsExtractorEditorEffectProvider,
    stringPartsExtractorEditorReducerProvider,
    stringPartsExtractorTestingReducerProvider,
    stringPartsExtractionEffectProvider
  ]);
};
