import { Component, ChangeDetectionStrategy, input, effect, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { createSignal } from 'ngssm-store';

import { selectNgssmStringPartsExtractionState } from '../../state';

@Component({
  selector: 'ngssm-extracted-part-result',
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './ngssm-extracted-part-result.component.html',
  styleUrls: ['./ngssm-extracted-part-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgssmExtractedPartResultComponent {
  private readonly extractionResult = createSignal(
    (state) => selectNgssmStringPartsExtractionState(state).stringPartsExtractorEditor.extractionResult
  );

  public readonly partName = input<string>('');

  public readonly hasResult = signal<boolean>(false);
  public readonly error = signal<string | undefined>(undefined);
  public readonly extractedItem = signal<unknown>(undefined);

  constructor() {
    effect(() => {
      const name = this.partName();
      const result = this.extractionResult();

      this.hasResult.set(
        !!result && Object.keys(result.extractedParts).length + Object.keys(result.errors).length === result.expectedPartsCount
      );
      this.error.set(result?.errors[name]);
      this.extractedItem.set(result?.extractedParts[name]);
    });
  }
}
