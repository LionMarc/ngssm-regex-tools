import { Action } from 'ngssm-store';
import { NgssmStringPartsExtractionActionType } from './ngssm-string-parts-extraction-action-type';

export class UpdateTestingStringAction implements Action {
  public readonly type: string = NgssmStringPartsExtractionActionType.updateTestingString;

  constructor(public readonly testingString: string) {}
}
