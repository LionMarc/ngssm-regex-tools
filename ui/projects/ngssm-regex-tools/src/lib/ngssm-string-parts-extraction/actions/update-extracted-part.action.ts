import { Action } from 'ngssm-store';
import { ExtractedPart } from '../model';
import { NgssmStringPartsExtractionActionType } from './ngssm-string-parts-extraction-action-type';

export class UpdateExtractedPartAction implements Action {
  public readonly type: string = NgssmStringPartsExtractionActionType.updateExtractedPart;

  constructor(public readonly extractedPart: ExtractedPart) {}
}
