import { Component, ChangeDetectionStrategy, Input, ElementRef, Optional, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { MatIconModule } from '@angular/material/icon';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BehaviorSubject, Observable, debounceTime, takeUntil } from 'rxjs';

import { NgSsmComponent, Store } from 'ngssm-store';

import { RegexToolsService } from '../ngssm-string-parts-extraction/services';
import { NGSSM_REGEX_TOOLS_CONFIG, NgssmRegexToolsConfig, getDefaultNgssmRegexToolsConfig } from '../ngssm-regex-tools-tools-config';

export const noop = () => {
  // Do nothing
};

@Component({
  selector: 'ngssm-regex',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    OverlayModule
  ],
  templateUrl: './ngssm-regex.component.html',
  styleUrls: ['./ngssm-regex.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: NgssmRegexComponent
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: NgssmRegexComponent
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgssmRegexComponent extends NgSsmComponent implements ControlValueAccessor, Validator {
  private readonly _testingControlOpen$ = new BehaviorSubject<boolean>(false);
  private readonly _isMatch$ = new BehaviorSubject<boolean | null>(null);
  private readonly regexConfig: NgssmRegexToolsConfig;

  private onChangeCallback: (_: string | null | undefined) => void = noop;
  private onTouchedCallback: (_: string | null | undefined) => void = noop;
  private onValidationChange: () => void = noop;
  private _required = false;
  private lastWrite: string | null = null;

  public readonly valueControl = new FormControl<string | null | undefined>(null);
  public readonly testingStringControl = new FormControl<string>('');

  constructor(
    store: Store,
    private regexToolsService: RegexToolsService,
    public elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(NGSSM_REGEX_TOOLS_CONFIG) @Optional() config?: NgssmRegexToolsConfig
  ) {
    super(store);

    this.regexConfig = config ?? getDefaultNgssmRegexToolsConfig();

    this.valueControl.valueChanges
      .pipe(debounceTime(this.regexConfig.regexControlDebounceTimeInMs), takeUntil(this.unsubscribeAll$))
      .subscribe((value) => {
        if (value !== this.lastWrite) {
          this.onTouchedCallback(value);
          this.onChangeCallback(value);
        }

        this.changeDetectorRef.markForCheck();
        this.lastWrite = null;
      });

    this.testingStringControl.valueChanges
      .pipe(debounceTime(this.regexConfig.regexControlDebounceTimeInMs), takeUntil(this.unsubscribeAll$))
      .subscribe(() => this.onValidationChange());
  }

  @Input()
  public get required(): boolean {
    return this._required;
  }

  public set required(value: boolean | string | null) {
    this._required = coerceBooleanProperty(value);
    this.onValidationChange();
  }

  public get testingControlOpen$(): Observable<boolean> {
    return this._testingControlOpen$.asObservable();
  }

  public get isMatch$(): Observable<boolean | null> {
    return this._isMatch$.asObservable();
  }

  public writeValue(obj: string | null | undefined): void {
    if (this.valueControl.value !== obj) {
      this.lastWrite = obj ?? null;
      this.valueControl.setValue(obj, { emitEvent: false });
      this.changeDetectorRef.markForCheck();
    }
  }

  public registerOnChange(fn: (_: string | null | undefined) => void): void {
    this.onChangeCallback = fn;
  }

  public registerOnTouched(fn: (_: string | null | undefined) => void): void {
    this.onTouchedCallback = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.valueControl.disable();
      if (this._testingControlOpen$.getValue()) {
        this.toggleTestingControlVisibility();
      }
    } else {
      this.valueControl.enable();
    }
  }

  public validate(control: AbstractControl<string | null | undefined, string | null | undefined>): ValidationErrors | null {
    let error: ValidationErrors | null = null;
    this._isMatch$.next(null);

    const value = control.value;
    if (value) {
      const result = this.regexToolsService.validateRegex(value);
      if (!result.isValid) {
        error = {
          regex: result.error
        };
      }

      // check test string only if testing control is open
      const testString = this.testingStringControl.value;
      if (!error && this._testingControlOpen$.getValue() && testString && testString.length > 0) {
        const isMatch = this.regexToolsService.isMatch(value, testString);
        if (!isMatch) {
          error = {
            test: 'Test string does not match'
          };
        }

        this._isMatch$.next(isMatch);
      }
    } else if (this._required) {
      error = {
        required: 'Value is required'
      };
    }

    this.valueControl.setErrors(error);

    return error;
  }

  public registerOnValidatorChange?(fn: () => void): void {
    this.onValidationChange = fn;
  }

  public toggleTestingControlVisibility(): void {
    this._testingControlOpen$.next(!this._testingControlOpen$.getValue());
    this.onValidationChange();
  }
}
