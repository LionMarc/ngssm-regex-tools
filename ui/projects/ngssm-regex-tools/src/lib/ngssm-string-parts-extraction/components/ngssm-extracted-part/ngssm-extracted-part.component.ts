import { Component, ChangeDetectionStrategy, Input, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BehaviorSubject, Observable, startWith, Subscription, takeUntil } from 'rxjs';

import { NgSsmComponent, Store } from 'ngssm-store';

import { selectNgssmStringPartsExtractionState } from '../../state';
import {
  ExtractedPartType,
  getDefaultNgssmRegexToolsDateFormats,
  getExtractedPartTypes,
  NGSSM_REGEX_TOOLS_DATE_FORMATS
} from '../../model';
import { UpdateExtractedPartAction } from '../../actions';

@Component({
  selector: 'ngssm-extracted-part',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatAutocompleteModule],
  templateUrl: './ngssm-extracted-part.component.html',
  styleUrls: ['./ngssm-extracted-part.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgssmExtractedPartComponent extends NgSsmComponent {
  private readonly _filteredFormats$ = new BehaviorSubject<string[]>([]);

  private readonly dateFormats: string[];

  private subscription: Subscription | undefined;
  private _partName = '';

  public readonly nameControl = new FormControl<string>('');
  public readonly extractedPartTypes = getExtractedPartTypes();
  public readonly extractedPartType = ExtractedPartType;
  public readonly typeControl = new FormControl<ExtractedPartType>(ExtractedPartType.text);
  public readonly formatControl = new FormControl<string | undefined>(undefined);

  public readonly formGroup = new FormGroup({
    name: this.nameControl,
    type: this.typeControl,
    format: this.formatControl
  });

  constructor(store: Store, @Inject(NGSSM_REGEX_TOOLS_DATE_FORMATS) @Optional() customDateFormats: string[]) {
    super(store);

    this.dateFormats = customDateFormats ?? getDefaultNgssmRegexToolsDateFormats();

    this.formatControl.valueChanges.pipe(startWith(''), takeUntil(this.unsubscribeAll$)).subscribe((value) => {
      this._filteredFormats$.next(this.dateFormats.filter((f) => f.startsWith(value ?? '')));
    });

    this.typeControl.valueChanges.pipe(takeUntil(this.unsubscribeAll$)).subscribe((type) => {
      if (type === ExtractedPartType.date) {
        this.formatControl.setValidators(Validators.required);
      } else {
        this.formatControl.setValidators([]);
      }

      this.formatControl.updateValueAndValidity();
    });

    this.formGroup.valueChanges
      .pipe(takeUntil(this.unsubscribeAll$))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .subscribe((value) => this.dispatchAction(new UpdateExtractedPartAction(value as any)));
  }

  @Input() public set partName(value: string) {
    this._partName = value;
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }

    this.subscription = this.watch((s) => selectNgssmStringPartsExtractionState(s).stringPartsExtractorEditor.parts).subscribe((values) => {
      const part = values.find((v) => v.name === this._partName);
      if (part) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.formGroup.setValue(part as any, { emitEvent: false });
      }
    });
  }

  public get filteredFormats$(): Observable<string[]> {
    return this._filteredFormats$.asObservable();
  }
}
