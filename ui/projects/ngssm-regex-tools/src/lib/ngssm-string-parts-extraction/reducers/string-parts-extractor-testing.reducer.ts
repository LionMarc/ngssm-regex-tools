import { Injectable, Provider } from '@angular/core';

import { Reducer, State, Action, NGSSM_REDUCER } from 'ngssm-store';

import { NgssmStringPartsExtractionActionType, RegisterStringPartsExtractionResultAction, UpdateTestingStringAction } from '../actions';
import { updateNgssmStringPartsExtractionState } from '../state';

@Injectable()
export class StringPartsExtractorTestingReducer implements Reducer {
  public readonly processedActions: string[] = [
    NgssmStringPartsExtractionActionType.updateTestingString,
    NgssmStringPartsExtractionActionType.registerStringPartsExtractionResult
  ];

  public updateState(state: State, action: Action): State {
    switch (action.type) {
      case NgssmStringPartsExtractionActionType.updateTestingString: {
        const updateTestingStringAction = action as UpdateTestingStringAction;
        return updateNgssmStringPartsExtractionState(state, {
          stringPartsExtractorEditor: {
            testingString: { $set: updateTestingStringAction.testingString }
          }
        });
      }

      case NgssmStringPartsExtractionActionType.registerStringPartsExtractionResult: {
        const registerStringPartsExtractionResultAction = action as RegisterStringPartsExtractionResultAction;
        return updateNgssmStringPartsExtractionState(state, {
          stringPartsExtractorEditor: {
            extractionResult: { $set: registerStringPartsExtractionResultAction.result }
          }
        });
      }
    }

    return state;
  }
}

export const stringPartsExtractorTestingReducerProvider: Provider = {
  provide: NGSSM_REDUCER,
  useClass: StringPartsExtractorTestingReducer,
  multi: true
};
