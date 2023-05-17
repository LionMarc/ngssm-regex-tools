import { TestBed } from '@angular/core/testing';

import { StoreMock } from 'ngssm-store';

import { NgssmStringPartsExtractionActionType } from '../actions';
import { RegexToolsService } from '../services';
import { StringPartsExtractionEffect } from './string-parts-extraction.effect';

const regexToolsServiceMock = {};

describe('StringPartsExtractionEffect', () => {
  let effect: StringPartsExtractionEffect;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let store: StoreMock;

  beforeEach(() => {
    store = new StoreMock({});
    TestBed.configureTestingModule({
      imports: [],
      providers: [StringPartsExtractionEffect, { provide: RegexToolsService, useValue: regexToolsServiceMock }]
    });
    effect = TestBed.inject(StringPartsExtractionEffect);
  });

  [
    NgssmStringPartsExtractionActionType.updateTestingString,
    NgssmStringPartsExtractionActionType.updateExpression,
    NgssmStringPartsExtractionActionType.updateExtractedPart
  ].forEach((actionType: string) => {
    it(`should process action of type '${actionType}'`, () => {
      expect(effect.processedActions).toContain(actionType);
    });
  });
});
