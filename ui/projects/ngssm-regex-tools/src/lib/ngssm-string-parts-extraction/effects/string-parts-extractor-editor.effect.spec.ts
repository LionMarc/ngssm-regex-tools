import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';

import { StoreMock } from 'ngssm-store';

import { NgssmStringPartsExtractionActionType } from '../actions';
import { StringPartsExtractorEditorEffect } from './string-parts-extractor-editor.effect';

describe('StringPartsExtractorEditorEffect', () => {
  let effect: StringPartsExtractorEditorEffect;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let store: StoreMock;

  beforeEach(() => {
    store = new StoreMock({});
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [StringPartsExtractorEditorEffect]
    });
    effect = TestBed.inject(StringPartsExtractorEditorEffect);
  });

  [
    NgssmStringPartsExtractionActionType.editStringPartsExtractor,
    NgssmStringPartsExtractionActionType.closeStringPartsExtractorEditor,
    NgssmStringPartsExtractionActionType.submitStringPartsExtractor
  ].forEach((actionType: string) => {
    it(`should process action of type '${actionType}'`, () => {
      expect(effect.processedActions).toContain(actionType);
    });
  });
});
