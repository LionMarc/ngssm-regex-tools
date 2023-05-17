import { Component, ChangeDetectionStrategy, AfterViewInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { BehaviorSubject, combineLatest, debounceTime, Observable, take, takeUntil } from 'rxjs';

import { NgSsmComponent, Store } from 'ngssm-store';

import { selectNgssmStringPartsExtractionState } from '../../state';
import { NgssmStringPartsExtractionActionType, UpdateExpressionAction, UpdateTestingStringAction } from '../../actions';
import { NgssmExtractedPartComponent } from '../ngssm-extracted-part/ngssm-extracted-part.component';
import { NgssmExtractedPartResultComponent } from '../ngssm-extracted-part-result/ngssm-extracted-part-result.component';
import { NGSSM_REGEX_TOOLS_CONFIG, NgssmRegexToolsConfig, getDefaultNgssmRegexToolsConfig } from '../../../ngssm-regex-tools-tools-config';

@Component({
  selector: 'ngssm-string-parts-extractor-editor',
  standalone: true,
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
export class NgssmStringPartsExtractorEditorComponent extends NgSsmComponent implements AfterViewInit {
  private readonly _canSubmit$ = new BehaviorSubject<boolean>(false);
  private readonly _extractedPartNames$ = new BehaviorSubject<string[]>([]);
  private readonly _isValid$ = new BehaviorSubject<boolean | undefined>(undefined);
  private readonly regexConfig: NgssmRegexToolsConfig;

  public readonly expressionControl = new FormControl<string | undefined>(undefined);
  public readonly testingStringControl = new FormControl<string>('');

  constructor(store: Store, @Inject(NGSSM_REGEX_TOOLS_CONFIG) @Optional() config?: NgssmRegexToolsConfig) {
    super(store);

    this.regexConfig = config ?? getDefaultNgssmRegexToolsConfig();

    this.expressionControl.valueChanges
      .pipe(debounceTime(this.regexConfig.regexControlDebounceTimeInMs), takeUntil(this.unsubscribeAll$))
      .subscribe((value) => this.dispatchAction(new UpdateExpressionAction(value)));

    combineLatest([
      this.watch((s) => selectNgssmStringPartsExtractionState(s).stringPartsExtractorEditor.validationResult),
      this.watch((s) => selectNgssmStringPartsExtractionState(s).stringPartsExtractorEditor.extractionResult)
    ]).subscribe((v) => this._canSubmit$.next(v[0].isValid && (!v[1] || v[1].isValid)));

    this.watch((s) => selectNgssmStringPartsExtractionState(s).stringPartsExtractorEditor.parts).subscribe((values) => {
      const names = values.map((v) => v.name);
      const displayedNames = this._extractedPartNames$.getValue();
      if (names.length !== displayedNames.length || names.findIndex((n) => !displayedNames.includes(n)) !== -1) {
        this._extractedPartNames$.next(names);
      }
    });

    this.watch((s) => selectNgssmStringPartsExtractionState(s).stringPartsExtractorEditor.testingString).subscribe((value) => {
      this.testingStringControl.setValue(value, { emitEvent: false });
    });

    this.testingStringControl.valueChanges
      .pipe(debounceTime(this.regexConfig.regexControlDebounceTimeInMs), takeUntil(this.unsubscribeAll$))
      .subscribe((value) => this.dispatchAction(new UpdateTestingStringAction(value ?? '')));

    this.watch((s) => selectNgssmStringPartsExtractionState(s).stringPartsExtractorEditor.extractionResult).subscribe((v) =>
      this._isValid$.next(v?.isValid)
    );
  }

  public get extractedPartNames$(): Observable<string[]> {
    return this._extractedPartNames$.asObservable();
  }

  public get canSubmit$(): Observable<boolean> {
    return this._canSubmit$.asObservable();
  }

  public get isValid$(): Observable<boolean | undefined> {
    return this._isValid$.asObservable();
  }

  public ngAfterViewInit(): void {
    this.watch((s) => selectNgssmStringPartsExtractionState(s).stringPartsExtractorEditor.expression)
      .pipe(take(1))
      .subscribe((value) => {
        this.expressionControl.setValue(value, { emitEvent: false });
      });

    this.watch((s) => selectNgssmStringPartsExtractionState(s).stringPartsExtractorEditor.expressionError).subscribe((value) => {
      if (value) {
        this.expressionControl.setErrors({ regex: value }, { emitEvent: false });
      } else {
        this.expressionControl.setErrors(null, { emitEvent: false });
      }
    });
  }

  public close(): void {
    this.dispatchActionType(NgssmStringPartsExtractionActionType.closeStringPartsExtractorEditor);
  }

  public submit(): void {
    this.dispatchActionType(NgssmStringPartsExtractionActionType.submitStringPartsExtractor);
  }
}
