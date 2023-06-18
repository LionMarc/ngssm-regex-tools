import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { StringPartsExtractionEffect, StringPartsExtractorEditorEffect } from './effects';
import { StringPartsExtractorEditorReducer, StringPartsExtractorTestingReducer } from './reducers';
import { provideEffects, provideReducers } from 'ngssm-store';

export const provideNgssmStringPartsExtraction = (): EnvironmentProviders => {
  return makeEnvironmentProviders([
    provideEffects(StringPartsExtractionEffect, StringPartsExtractorEditorEffect),
    provideReducers(StringPartsExtractorEditorReducer, StringPartsExtractorTestingReducer)
  ]);
};
