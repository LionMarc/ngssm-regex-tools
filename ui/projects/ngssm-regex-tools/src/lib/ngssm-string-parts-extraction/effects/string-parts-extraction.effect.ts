import { Injectable, Provider } from '@angular/core';

import { Effect, Store, State, Action, NGSSM_EFFECT } from 'ngssm-store';

import { NgssmStringPartsExtractionActionType, RegisterStringPartsExtractionResultAction } from '../actions';
import { RegexToolsService } from '../services';
import { selectNgssmStringPartsExtractionState } from '../state';

@Injectable()
export class StringPartsExtractionEffect implements Effect {
  public readonly processedActions: string[] = [
    NgssmStringPartsExtractionActionType.updateTestingString,
    NgssmStringPartsExtractionActionType.updateExpression,
    NgssmStringPartsExtractionActionType.updateExtractedPart
  ];

  constructor(private regexToolsService: RegexToolsService) {}

  public processAction(store: Store, state: State, action: Action): void {
    switch (action.type) {
      case NgssmStringPartsExtractionActionType.updateTestingString:
      case NgssmStringPartsExtractionActionType.updateExpression:
      case NgssmStringPartsExtractionActionType.updateExtractedPart: {
        if (
          !selectNgssmStringPartsExtractionState(state).stringPartsExtractorEditor.validationResult.isValid ||
          selectNgssmStringPartsExtractionState(state).stringPartsExtractorEditor.testingString.trim().length === 0
        ) {
          store.dispatchAction(new RegisterStringPartsExtractionResultAction());
          break;
        }

        const result = this.regexToolsService.extractParts(
          {
            expression: selectNgssmStringPartsExtractionState(state).stringPartsExtractorEditor.expression ?? '',
            parts: selectNgssmStringPartsExtractionState(state).stringPartsExtractorEditor.parts
          },
          selectNgssmStringPartsExtractionState(state).stringPartsExtractorEditor.testingString
        );

        store.dispatchAction(new RegisterStringPartsExtractionResultAction(result));

        break;
      }
    }
  }
}

export const stringPartsExtractionEffectProvider: Provider = {
  provide: NGSSM_EFFECT,
  useClass: StringPartsExtractionEffect,
  multi: true
};
