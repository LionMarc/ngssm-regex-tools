import { Component, ChangeDetectionStrategy, AfterViewInit, inject, signal, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { debounceTime } from 'rxjs';

import { createSignal, Store } from 'ngssm-store';

import { selectNgssmStringPartsExtractionState } from '../../state';
import { NgssmStringPartsExtractionActionType, UpdateExpressionAction, UpdateTestingStringAction } from '../../actions';
import { NgssmExtractedPartComponent } from '../ngssm-extracted-part/ngssm-extracted-part.component';
import { NgssmExtractedPartResultComponent } from '../ngssm-extracted-part-result/ngssm-extracted-part-result.component';
import { NGSSM_REGEX_TOOLS_CONFIG, NgssmRegexToolsConfig, getDefaultNgssmRegexToolsConfig } from '../../../ngssm-regex-tools-tools-config';

@Component({
  selector: 'ngssm-string-parts-extractor-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    NgssmExtractedPartComponent,
    NgssmExtractedPartResultComponent
  ],
  templateUrl: './ngssm-string-parts-extractor-editor.component.html',
  styleUrls: ['./ngssm-string-parts-extractor-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgssmStringPartsExtractorEditorComponent implements AfterViewInit {
  private readonly store = inject(Store);
  private readonly config: NgssmRegexToolsConfig | null = inject(NGSSM_REGEX_TOOLS_CONFIG, { optional: true });

  private readonly parts = createSignal((state) => selectNgssmStringPartsExtractionState(state).stringPartsExtractorEditor.parts);
  private readonly testingString = createSignal(
    (state) => selectNgssmStringPartsExtractionState(state).stringPartsExtractorEditor.testingString
  );
  private readonly expressionError = createSignal(
    (state) => selectNgssmStringPartsExtractionState(state).stringPartsExtractorEditor.expressionError
  );

  public readonly canSubmit = createSignal<boolean>((state) => {
    const validationResult = selectNgssmStringPartsExtractionState(state).stringPartsExtractorEditor.validationResult;
    const extractionResult = selectNgssmStringPartsExtractionState(state).stringPartsExtractorEditor.extractionResult;
    return validationResult.isValid && (!extractionResult || extractionResult.isValid);
  });
  public readonly extractedPartNames = signal<string[]>([]);
  public readonly isValid = createSignal<boolean | undefined>(
    (state) => selectNgssmStringPartsExtractionState(state).stringPartsExtractorEditor.extractionResult?.isValid
  );

  public readonly expressionControl = new FormControl<string | undefined>(undefined);
  public readonly testingStringControl = new FormControl<string>('');

  constructor() {
    const regexConfig = this.config ?? getDefaultNgssmRegexToolsConfig();

    this.expressionControl.valueChanges
      .pipe(debounceTime(regexConfig.regexControlDebounceTimeInMs), takeUntilDestroyed())
      .subscribe((value) => this.store.dispatchAction(new UpdateExpressionAction(value)));

    effect(() => {
      const parts = this.parts();
      const displayedNames = this.extractedPartNames();
      const names = parts.map((v) => v.name);
      if (names.length !== displayedNames.length || names.findIndex((n) => !displayedNames.includes(n)) !== -1) {
        this.extractedPartNames.set(names);
      }
    });

    effect(() => {
      const test = this.testingString();
      this.testingStringControl.setValue(test, { emitEvent: false });
    });

    this.testingStringControl.valueChanges
      .pipe(debounceTime(regexConfig.regexControlDebounceTimeInMs), takeUntilDestroyed())
      .subscribe((value) => this.store.dispatchAction(new UpdateTestingStringAction(value ?? '')));

    effect(() => {
      const error = this.expressionError();
      if (error) {
        this.expressionControl.setErrors({ regex: error }, { emitEvent: false });
      } else {
        this.expressionControl.setErrors(null, { emitEvent: false });
      }
    });
  }

  public ngAfterViewInit(): void {
    const expression = selectNgssmStringPartsExtractionState(this.store.state()).stringPartsExtractorEditor.expression;
    this.expressionControl.setValue(expression, { emitEvent: false });
  }

  public close(): void {
    this.store.dispatchActionType(NgssmStringPartsExtractionActionType.closeStringPartsExtractorEditor);
  }

  public submit(): void {
    this.store.dispatchActionType(NgssmStringPartsExtractionActionType.submitStringPartsExtractor);
  }
}
