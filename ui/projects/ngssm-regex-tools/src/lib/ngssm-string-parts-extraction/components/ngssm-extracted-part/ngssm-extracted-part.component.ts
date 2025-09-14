import { Component, ChangeDetectionStrategy, inject, signal, effect, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { startWith } from 'rxjs';

import { createSignal, Store } from 'ngssm-store';

import { selectNgssmStringPartsExtractionState } from '../../state';
import {
  ExtractedPart,
  ExtractedPartType,
  getDefaultNgssmRegexToolsDateFormats,
  getExtractedPartTypes,
  NGSSM_REGEX_TOOLS_DATE_FORMATS
} from '../../model';
import { UpdateExtractedPartAction } from '../../actions';

@Component({
  selector: 'ngssm-extracted-part',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatSelect, MatOption, MatAutocomplete, MatAutocompleteTrigger],
  templateUrl: './ngssm-extracted-part.component.html',
  styleUrls: ['./ngssm-extracted-part.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgssmExtractedPartComponent {
  private readonly store = inject(Store);
  private readonly customDateFormats: string[] | null = inject(NGSSM_REGEX_TOOLS_DATE_FORMATS, { optional: true });

  private readonly parts = createSignal((state) => selectNgssmStringPartsExtractionState(state).stringPartsExtractorEditor.parts);

  public readonly partName = input<string>('');

  public readonly filteredFormats = signal<string[]>([]);
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

  constructor() {
    const dateFormats = this.customDateFormats ?? getDefaultNgssmRegexToolsDateFormats();
    this.formatControl.valueChanges.pipe(startWith(''), takeUntilDestroyed()).subscribe((value) => {
      this.filteredFormats.set(dateFormats.filter((f) => f.startsWith(value ?? '')));
    });

    this.typeControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((type) => {
      if (type === ExtractedPartType.date) {
        this.formatControl.setValidators(Validators.required);
      } else {
        this.formatControl.setValidators([]);
      }

      this.formatControl.updateValueAndValidity();
    });

    this.formGroup.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.store.dispatchAction(new UpdateExtractedPartAction(value as unknown as ExtractedPart)));

    effect(() => {
      const name = this.partName();
      const part = this.parts().find((v) => v.name === name);
      if (part) {
        this.formGroup.setValue(part, { emitEvent: false });
      }
    });
  }
}
