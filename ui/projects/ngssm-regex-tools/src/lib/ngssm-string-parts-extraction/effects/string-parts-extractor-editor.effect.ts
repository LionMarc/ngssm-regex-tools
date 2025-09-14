import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { Effect, Store, State, Action } from 'ngssm-store';

import { NgssmStringPartsExtractionActionType } from '../actions';
import { NgssmStringPartsExtractorEditorComponent } from '../components';

@Injectable()
export class StringPartsExtractorEditorEffect implements Effect {
  private readonly matDialog = inject(MatDialog);

  private dialog: MatDialogRef<NgssmStringPartsExtractorEditorComponent> | undefined;

  public readonly processedActions: string[] = [
    NgssmStringPartsExtractionActionType.editStringPartsExtractor,
    NgssmStringPartsExtractionActionType.closeStringPartsExtractorEditor,
    NgssmStringPartsExtractionActionType.submitStringPartsExtractor
  ];

  public processAction(store: Store, state: State, action: Action): void {
    switch (action.type) {
      case NgssmStringPartsExtractionActionType.editStringPartsExtractor: {
        this.dialog = this.matDialog.open(NgssmStringPartsExtractorEditorComponent, {
          disableClose: true,
          width: '80vw',
          height: '80vh'
        });

        break;
      }

      case NgssmStringPartsExtractionActionType.closeStringPartsExtractorEditor:
      case NgssmStringPartsExtractionActionType.submitStringPartsExtractor: {
        this.dialog?.close();
        this.dialog = undefined;

        break;
      }
    }
  }
}
