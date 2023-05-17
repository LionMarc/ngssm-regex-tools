import { Action } from 'ngssm-store';
import { StringPartsExtractionResult } from '../model';
import { NgssmStringPartsExtractionActionType } from './ngssm-string-parts-extraction-action-type';

export class RegisterStringPartsExtractionResultAction implements Action {
  public readonly type: string = NgssmStringPartsExtractionActionType.registerStringPartsExtractionResult;

  constructor(public readonly result?: StringPartsExtractionResult) {}
}
