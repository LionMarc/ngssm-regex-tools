import update, { Spec } from 'immutability-helper';

import { NgSsmFeatureState, State } from 'ngssm-store';

import { getDefaultStringPartsExtractorEditor, StringPartsExtractorEditor } from './string-parts-extractor-editor';

export const selectNgssmStringPartsExtractionState = (state: State): NgssmStringPartsExtractionState =>
  state[NgssmStringPartsExtractionStateSpecification.featureStateKey] as NgssmStringPartsExtractionState;

export const updateNgssmStringPartsExtractionState = (state: State, command: Spec<NgssmStringPartsExtractionState, never>): State =>
  update(state, {
    [NgssmStringPartsExtractionStateSpecification.featureStateKey]: command
  });

export interface NgssmStringPartsExtractionState {
  stringPartsExtractorEditor: StringPartsExtractorEditor;
}

@NgSsmFeatureState({
  featureStateKey: NgssmStringPartsExtractionStateSpecification.featureStateKey,
  initialState: NgssmStringPartsExtractionStateSpecification.initialState
})
export class NgssmStringPartsExtractionStateSpecification {
  public static readonly featureStateKey = 'ngssm-string-parts-extraction-state';
  public static readonly initialState: NgssmStringPartsExtractionState = {
    stringPartsExtractorEditor: getDefaultStringPartsExtractorEditor()
  };
}
