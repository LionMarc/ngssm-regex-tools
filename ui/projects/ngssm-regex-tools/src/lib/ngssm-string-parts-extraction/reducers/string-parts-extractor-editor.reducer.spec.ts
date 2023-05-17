import { TestBed } from '@angular/core/testing';
import { Action } from 'ngssm-store';

import {
  EditStringPartsExtractorAction,
  NgssmStringPartsExtractionActionType,
  UpdateExpressionAction,
  UpdateExtractedPartAction
} from '../actions';
import { ExtractedPart, ExtractedPartType } from '../model';
import { RegexToolsService } from '../services';
import {
  NgssmStringPartsExtractionStateSpecification,
  selectNgssmStringPartsExtractionState,
  updateNgssmStringPartsExtractionState
} from '../state';
import { StringPartsExtractorEditorReducer } from './string-parts-extractor-editor.reducer';

describe('StringPartsExtractorEditorReducer', () => {
  let reducer: StringPartsExtractorEditorReducer;
  let state: { [key: string]: object };
  let regexToolsService: RegexToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [StringPartsExtractorEditorReducer]
    });
    reducer = TestBed.inject(StringPartsExtractorEditorReducer);
    regexToolsService = TestBed.inject(RegexToolsService);
    state = {
      [NgssmStringPartsExtractionStateSpecification.featureStateKey]: NgssmStringPartsExtractionStateSpecification.initialState
    };
  });

  [
    NgssmStringPartsExtractionActionType.editStringPartsExtractor,
    NgssmStringPartsExtractionActionType.updateExpression,
    NgssmStringPartsExtractionActionType.updateExtractedPart,
    NgssmStringPartsExtractionActionType.submitStringPartsExtractor
  ].forEach((actionType: string) => {
    it(`should process action of type '${actionType}'`, () => {
      expect(reducer.processedActions).toContain(actionType);
    });
  });

  it('should return input state when processing not valid action type', () => {
    const updatedState = reducer.updateState(state, { type: 'not-processed' });

    expect(updatedState).toBe(state);
  });

  describe(`when processing action of type '${NgssmStringPartsExtractionActionType.editStringPartsExtractor}'`, () => {
    const action = new EditStringPartsExtractorAction('my-control', {
      expression: '^(?<date>\\d{8})_',
      parts: [{ name: 'date', type: ExtractedPartType.date, format: 'yyyyMMdd' }]
    });

    beforeEach(() => {
      state = updateNgssmStringPartsExtractionState(state, {
        stringPartsExtractorEditor: {
          controlId: { $set: 'previousone' },
          expression: { $set: 'something' },
          parts: {
            $set: [
              {
                name: 'isin',
                type: ExtractedPartType.text,
                format: null
              }
            ]
          },
          extractor: {
            $set: {
              expression: 'something',
              parts: [
                {
                  name: 'isin',
                  type: ExtractedPartType.text,
                  format: null
                }
              ]
            }
          }
        }
      });
    });

    it(`should update the controlId state property`, () => {
      const updatedState = reducer.updateState(state, action);

      expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.controlId).toEqual('my-control');
    });

    it(`should update the expression state property`, () => {
      const updatedState = reducer.updateState(state, action);

      expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.expression).toEqual('^(?<date>\\d{8})_');
    });

    it(`should update the parts state property`, () => {
      const updatedState = reducer.updateState(state, action);

      expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.parts).toEqual([
        { name: 'date', type: ExtractedPartType.date, format: 'yyyyMMdd' }
      ]);
    });

    it(`should set to undefined the extractor state property`, () => {
      const updatedState = reducer.updateState(state, action);

      expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.extractor).toEqual(undefined);
    });
  });

  describe(`when processing action of type '${NgssmStringPartsExtractionActionType.updateExpression}'`, () => {
    const parts: ExtractedPart[] = [
      {
        name: 'code',
        type: ExtractedPartType.text,
        format: null
      },
      {
        name: 'date',
        type: ExtractedPartType.date,
        format: 'yyyyMMdd'
      }
    ];

    beforeEach(() => {
      state = updateNgssmStringPartsExtractionState(state, {
        stringPartsExtractorEditor: {
          expression: { $set: 'something' },
          parts: { $set: parts },
          validationResult: {
            $set: {
              isValid: true,
              errors: {}
            }
          }
        }
      });
    });

    it(`should update the expression state property`, () => {
      const action = new UpdateExpressionAction('^(?<date>\\d{8})_');

      const updatedState = reducer.updateState(state, action);

      expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.expression).toEqual('^(?<date>\\d{8})_');
    });

    [null, undefined].forEach((expression) => {
      it(`should not modify the parts state property when new expression is ${expression}`, () => {
        const action = new UpdateExpressionAction(expression);

        const updatedState = reducer.updateState(state, action);

        expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.parts).toBe(parts);
      });
    });

    it(`should not modify the parts state property when new expression is not valid`, () => {
      spyOn(regexToolsService, 'validateRegex').and.returnValue({
        isValid: false
      });

      const action = new UpdateExpressionAction('new');

      const updatedState = reducer.updateState(state, action);

      expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.parts).toBe(parts);
    });

    describe('when new regular expression is a valid regex', () => {
      const action = new UpdateExpressionAction('new');

      beforeEach(() => {
        spyOn(regexToolsService, 'validateRegex').and.returnValue({
          isValid: true
        });
      });

      it(`should not modify the parts state property when expression has no group`, () => {
        spyOn(regexToolsService, 'getGroupNames').and.returnValue([]);

        const updatedState = reducer.updateState(state, action);

        expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.parts).toBe(parts);
      });

      it(`should remove part from state when part is no more in expression`, () => {
        spyOn(regexToolsService, 'getGroupNames').and.returnValue(['date']);

        const updatedState = reducer.updateState(state, action);

        expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.parts).toEqual([
          {
            name: 'date',
            type: ExtractedPartType.date,
            format: 'yyyyMMdd'
          }
        ]);
      });

      it(`should add part into state when part is new in expression`, () => {
        spyOn(regexToolsService, 'getGroupNames').and.returnValue(['code', 'label', 'date']);

        const updatedState = reducer.updateState(state, action);

        expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.parts).toEqual([
          {
            name: 'code',
            type: ExtractedPartType.text,
            format: null
          },
          {
            name: 'label',
            type: ExtractedPartType.text,
            format: null
          },
          {
            name: 'date',
            type: ExtractedPartType.date,
            format: 'yyyyMMdd'
          }
        ]);
      });
    });

    it(`should update the validationResult state property with the result returned by the service`, () => {
      spyOn(regexToolsService, 'validateStringPartsExtractor').and.returnValue({
        isValid: false,
        errors: {
          expression: ['wrong']
        }
      });

      const action = new UpdateExpressionAction('new');

      const updatedState = reducer.updateState(state, action);

      expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.validationResult).toEqual({
        isValid: false,
        errors: {
          expression: ['wrong']
        }
      });
    });

    it(`should update the expressionError state property with the result returned by the service`, () => {
      spyOn(regexToolsService, 'validateStringPartsExtractor').and.returnValue({
        isValid: false,
        errors: {
          expression: ['wrong']
        }
      });

      const action = new UpdateExpressionAction('new');

      const updatedState = reducer.updateState(state, action);

      expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.expressionError).toEqual('wrong');
    });
  });

  describe(`when processing action of type '${NgssmStringPartsExtractionActionType.updateExtractedPart}'`, () => {
    const parts: ExtractedPart[] = [
      {
        name: 'code',
        type: ExtractedPartType.text,
        format: null
      },
      {
        name: 'date',
        type: ExtractedPartType.date,
        format: 'yyyyMMdd'
      }
    ];

    beforeEach(() => {
      state = updateNgssmStringPartsExtractionState(state, {
        stringPartsExtractorEditor: {
          expression: { $set: 'something' },
          parts: { $set: parts },
          validationResult: {
            $set: {
              isValid: true,
              errors: {}
            }
          }
        }
      });
    });

    it(`should not modify the parts state property when part in action is not found in state`, () => {
      const action = new UpdateExtractedPartAction({
        name: 'notFound',
        type: ExtractedPartType.text,
        format: null
      });

      const updatedState = reducer.updateState(state, action);

      expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.parts).toBe(parts);
    });

    it(`should replace the part in the parts state property when part in action is found in state`, () => {
      const action = new UpdateExtractedPartAction({
        name: 'date',
        type: ExtractedPartType.text,
        format: null
      });

      const updatedState = reducer.updateState(state, action);

      expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.parts).toEqual([
        {
          name: 'code',
          type: ExtractedPartType.text,
          format: null
        },
        {
          name: 'date',
          type: ExtractedPartType.text,
          format: null
        }
      ]);
    });

    it(`should update the validationResult state property with the result returned by the service`, () => {
      spyOn(regexToolsService, 'validateStringPartsExtractor').and.returnValue({
        isValid: false,
        errors: {
          expression: ['wrong']
        }
      });

      const action = new UpdateExtractedPartAction({
        name: 'date',
        type: ExtractedPartType.text,
        format: null
      });

      const updatedState = reducer.updateState(state, action);

      expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.validationResult).toEqual({
        isValid: false,
        errors: {
          expression: ['wrong']
        }
      });
    });

    it(`should update the expressionError state property with the result returned by the service`, () => {
      spyOn(regexToolsService, 'validateStringPartsExtractor').and.returnValue({
        isValid: false,
        errors: {
          expression: ['wrong']
        }
      });

      const action = new UpdateExtractedPartAction({
        name: 'date',
        type: ExtractedPartType.text,
        format: null
      });

      const updatedState = reducer.updateState(state, action);

      expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.expressionError).toEqual('wrong');
    });
  });

  describe(`when processing action of type '${NgssmStringPartsExtractionActionType.submitStringPartsExtractor}'`, () => {
    const action: Action = { type: NgssmStringPartsExtractionActionType.submitStringPartsExtractor };

    beforeEach(() => {
      state = updateNgssmStringPartsExtractionState(state, {
        stringPartsExtractorEditor: {
          controlId: { $set: 'previousone' },
          expression: { $set: 'something' },
          parts: {
            $set: [
              {
                name: 'isin',
                type: ExtractedPartType.text,
                format: null
              }
            ]
          },
          extractor: {
            $set: undefined
          },
          expressionError: { $set: 'wrong type' },
          validationResult: {
            $set: {
              isValid: false,
              errors: {
                expression: ['todo']
              }
            }
          },
          testingString: { $set: 'test' },
          extractionResult: {
            $set: {
              isValid: true,
              expectedPartsCount: 4,
              errors: {},
              extractedParts: {}
            }
          }
        }
      });
    });

    it(`should set the extractor state property from the expression and parts properties`, () => {
      const updatedState = reducer.updateState(state, action);

      expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.extractor).toEqual({
        expression: 'something',
        parts: [
          {
            name: 'isin',
            type: ExtractedPartType.text,
            format: null
          }
        ]
      });
    });

    it(`should set to undefined the expression state property`, () => {
      const updatedState = reducer.updateState(state, action);

      expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.expression).toEqual(undefined);
    });

    it(`should set to undefined the expressionError state property`, () => {
      const updatedState = reducer.updateState(state, action);

      expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.expressionError).toEqual(undefined);
    });

    it(`should set to empty array the parts state property`, () => {
      const updatedState = reducer.updateState(state, action);

      expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.parts).toEqual([]);
    });

    it(`should set to valid the validation result state property`, () => {
      const updatedState = reducer.updateState(state, action);

      expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.validationResult).toEqual({
        isValid: true,
        errors: {}
      });
    });

    it(`should set to empty the testingString result state property`, () => {
      const updatedState = reducer.updateState(state, action);

      expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.testingString).toEqual('');
    });

    it(`should set to undefined the extractionResult state property`, () => {
      const updatedState = reducer.updateState(state, action);

      expect(selectNgssmStringPartsExtractionState(updatedState).stringPartsExtractorEditor.extractionResult).toEqual(undefined);
    });
  });
});
