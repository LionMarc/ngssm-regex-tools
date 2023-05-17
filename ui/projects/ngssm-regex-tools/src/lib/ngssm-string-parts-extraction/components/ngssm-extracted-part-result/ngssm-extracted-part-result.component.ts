import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { NgSsmComponent, Store } from 'ngssm-store';

import { selectNgssmStringPartsExtractionState } from '../../state';

@Component({
  selector: 'ngssm-extracted-part-result',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './ngssm-extracted-part-result.component.html',
  styleUrls: ['./ngssm-extracted-part-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgssmExtractedPartResultComponent extends NgSsmComponent {
  private readonly _hasResult$ = new BehaviorSubject<boolean>(false);
  private readonly _error$ = new BehaviorSubject<string | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly _extractedItem$ = new BehaviorSubject<any>(undefined);

  private subscription: Subscription | undefined;
  private _partName = '';

  public readonly nameControl = new FormControl<string>('');

  constructor(store: Store) {
    super(store);
  }

  @Input() public set partName(value: string) {
    this._partName = value;
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }

    this.nameControl.setValue(this._partName);

    this.subscription = this.watch((s) => selectNgssmStringPartsExtractionState(s).stringPartsExtractorEditor.extractionResult).subscribe(
      (result) => {
        this._hasResult$.next(
          !!result && Object.keys(result.extractedParts).length + Object.keys(result.errors).length === result.expectedPartsCount
        );
        this._error$.next(result?.errors[this._partName]);
        this._extractedItem$.next(result?.extractedParts[this._partName]);
      }
    );
  }

  public get hasResult$(): Observable<boolean> {
    return this._hasResult$.asObservable();
  }

  public get error$(): Observable<string | undefined> {
    return this._error$.asObservable();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public get extractedItem$(): Observable<any> {
    return this._extractedItem$.asObservable();
  }
}
