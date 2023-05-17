import { Action } from 'ngssm-store';
import { NgssmStringPartsExtractionActionType } from './ngssm-string-parts-extraction-action-type';

export class UpdateExpressionAction implements Action {
  public readonly type: string = NgssmStringPartsExtractionActionType.updateExpression;

  constructor(public readonly expression: string | null | undefined) {}
}
