import { inject, Injectable } from '@angular/core';

import { Effect, Store, State, Action } from 'ngssm-store';

import { NgssmStringPartsExtractionActionType, RegisterStringPartsExtractionResultAction } from '../actions';
import { RegexToolsService } from '../services';
import { selectNgssmStringPartsExtractionState } from '../state';

@Injectable()
export class StringPartsExtractionEffect implements Effect {
  private readonly regexToolsService = inject(RegexToolsService);

  public readonly processedActions: string[] = [
    NgssmStringPartsExtractionActionType.updateTestingString,
    NgssmStringPartsExtractionActionType.updateExpression,
    NgssmStringPartsExtractionActionType.updateExtractedPart
  ];

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
