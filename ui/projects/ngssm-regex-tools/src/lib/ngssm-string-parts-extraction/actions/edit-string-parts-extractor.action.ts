import { Action } from 'ngssm-store';

import { StringPartsExtractor } from '../model';
import { NgssmStringPartsExtractionActionType } from './ngssm-string-parts-extraction-action-type';

export class EditStringPartsExtractorAction implements Action {
  public readonly type: string = NgssmStringPartsExtractionActionType.editStringPartsExtractor;

  constructor(public readonly controlId: string, public readonly extractor?: StringPartsExtractor) {}
}
