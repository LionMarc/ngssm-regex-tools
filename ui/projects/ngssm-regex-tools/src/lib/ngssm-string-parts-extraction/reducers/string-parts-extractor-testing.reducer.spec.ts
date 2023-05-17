import { NgssmStringPartsExtractionActionType } from '../actions';
import { StringPartsExtractorTestingReducer } from './string-parts-extractor-testing.reducer';

describe('StringPartsExtractorTestingReducer', () => {
  let reducer: StringPartsExtractorTestingReducer;
  let state: { [key: string]: object };

  beforeEach(() => {
    reducer = new StringPartsExtractorTestingReducer();
    state = {};
  });

  [
    NgssmStringPartsExtractionActionType.updateTestingString,
    NgssmStringPartsExtractionActionType.registerStringPartsExtractionResult
  ].forEach((actionType: string) => {
    it(`should process action of type '${actionType}'`, () => {
      expect(reducer.processedActions).toContain(actionType);
    });
  });

  it('should return input state when processing not valid action type', () => {
    const updatedState = reducer.updateState(state, { type: 'not-processed' });

    expect(updatedState).toBe(state);
  });
});
