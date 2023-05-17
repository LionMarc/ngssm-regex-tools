import { Injectable, Provider } from '@angular/core';

import { Reducer, State, Action, NGSSM_REDUCER } from 'ngssm-store';

import {
  EditStringPartsExtractorAction,
  NgssmStringPartsExtractionActionType,
  UpdateExpressionAction,
  UpdateExtractedPartAction
} from '../actions';
import { ExtractedPart, ExtractedPartType, getExpressionErrors, StringPartsExtractor } from '../model';
import { RegexToolsService } from '../services';
import { selectNgssmStringPartsExtractionState, updateNgssmStringPartsExtractionState } from '../state';

@Injectable()
export class StringPartsExtractorEditorReducer implements Reducer {
  public readonly processedActions: string[] = [
    NgssmStringPartsExtractionActionType.editStringPartsExtractor,
    NgssmStringPartsExtractionActionType.updateExpression,
    NgssmStringPartsExtractionActionType.updateExtractedPart,
    NgssmStringPartsExtractionActionType.submitStringPartsExtractor
  ];

  constructor(private regexToolsService: RegexToolsService) {}

  public updateState(state: State, action: Action): State {
    let updatedState = state;
    switch (action.type) {
      case NgssmStringPartsExtractionActionType.editStringPartsExtractor: {
        const editStringPartsExtractorAction = action as EditStringPartsExtractorAction;
        updatedState = updateNgssmStringPartsExtractionState(updatedState, {
          stringPartsExtractorEditor: {
            controlId: { $set: editStringPartsExtractorAction.controlId },
            expression: { $set: editStringPartsExtractorAction.extractor?.expression },
            parts: { $set: [...(editStringPartsExtractorAction.extractor?.parts ?? [])] },
            extractor: { $set: undefined }
          }
        });

        break;
      }

      case NgssmStringPartsExtractionActionType.updateExpression: {
        const updateExpressionAction = action as UpdateExpressionAction;
        updatedState = updateNgssmStringPartsExtractionState(updatedState, {
          stringPartsExtractorEditor: {
            expression: { $set: updateExpressionAction.expression ?? undefined },
            parts: {
              $apply: (values: ExtractedPart[]) => {
                if (
                  !updateExpressionAction.expression ||
                  !this.regexToolsService.validateRegex(updateExpressionAction.expression).isValid
                ) {
                  return values;
                }

                const groupNames = this.regexToolsService.getGroupNames(updateExpressionAction.expression ?? '');
                if (groupNames.length === 0) {
                  return values;
                }

                const output: ExtractedPart[] = [];
                groupNames.forEach((g) => {
                  const part = values.find((v) => v.name === g);
                  if (part) {
                    output.push(part);
                  } else {
                    output.push({
                      type: ExtractedPartType.text,
                      name: g,
                      format: null
                    });
                  }
                });

                return output;
              }
            }
          }
        });

        break;
      }

      case NgssmStringPartsExtractionActionType.updateExtractedPart: {
        const updateExtractedPartAction = action as UpdateExtractedPartAction;
        updatedState = updateNgssmStringPartsExtractionState(updatedState, {
          stringPartsExtractorEditor: {
            parts: {
              $apply: (values: ExtractedPart[]) => {
                const partIndex = values.findIndex((p) => p.name === updateExtractedPartAction.extractedPart.name);
                if (partIndex === -1) {
                  return values;
                }

                const output = [...values];
                output.splice(partIndex, 1, updateExtractedPartAction.extractedPart);

                return output;
              }
            }
          }
        });

        break;
      }

      case NgssmStringPartsExtractionActionType.submitStringPartsExtractor: {
        const extractor: StringPartsExtractor = {
          expression: selectNgssmStringPartsExtractionState(state).stringPartsExtractorEditor.expression ?? '',
          parts: selectNgssmStringPartsExtractionState(state).stringPartsExtractorEditor.parts
        };
        return updateNgssmStringPartsExtractionState(state, {
          stringPartsExtractorEditor: {
            extractor: { $set: extractor },
            expression: { $set: undefined },
            expressionError: { $set: undefined },
            parts: { $set: [] },
            validationResult: { $set: { isValid: true, errors: {} } },
            testingString: { $set: '' },
            extractionResult: { $set: undefined }
          }
        });
      }
    }

    if (updatedState !== state) {
      const validationResult = this.regexToolsService.validateStringPartsExtractor({
        expression: selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.expression ?? '',
        parts: selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.parts
      });

      updatedState = updateNgssmStringPartsExtractionState(updatedState, {
        stringPartsExtractorEditor: {
          validationResult: { $set: validationResult },
          expressionError: { $set: getExpressionErrors(validationResult)?.[0] }
        }
      });
    }

    return updatedState;
  }
}

export const stringPartsExtractorEditorReducerProvider: Provider = {
  provide: NGSSM_REDUCER,
  useClass: StringPartsExtractorEditorReducer,
  multi: true
};
