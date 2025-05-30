import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  ChangeDetectorRef,
  inject,
  input,
  booleanAttribute,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { MatIconModule } from '@angular/material/icon';
import { ConnectionPositionPair, OverlayModule } from '@angular/cdk/overlay';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime } from 'rxjs';

import { RegexToolsService } from '../ngssm-string-parts-extraction/services';
import { NGSSM_REGEX_TOOLS_CONFIG, NgssmRegexToolsConfig, getDefaultNgssmRegexToolsConfig } from '../ngssm-regex-tools-tools-config';

export const noop = () => {
  // Do nothing
};

@Component({
  selector: 'ngssm-regex',
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
export class NgssmRegexComponent implements ControlValueAccessor, Validator {
  private readonly regexToolsService = inject(RegexToolsService);
  public readonly elementRef = inject(ElementRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly config: NgssmRegexToolsConfig | null = inject(NGSSM_REGEX_TOOLS_CONFIG, { optional: true });

  private readonly regexConfig: NgssmRegexToolsConfig;

  private onChangeCallback: (_: string | null | undefined) => void = noop;
  private onTouchedCallback: (_: string | null | undefined) => void = noop;
  private onValidationChange: () => void = noop;
  private lastWrite: string | null = null;

  public readonly required = input<boolean, unknown>(false, {
    transform: booleanAttribute
  });
  public readonly testingControlOpen = signal<boolean>(false);
  public readonly isMatch = signal<boolean | null>(null);
  public readonly valueControl = new FormControl<string | null | undefined>(null);
  public readonly testingStringControl = new FormControl<string>('');

  public readonly overlayPositions: ConnectionPositionPair[] = [
    new ConnectionPositionPair(
      {
        originX: 'end',
        originY: 'bottom'
      },
      {
        overlayX: 'end',
        overlayY: 'top'
      },
      0,
      0
    )
  ];

  constructor() {
    this.regexConfig = this.config ?? getDefaultNgssmRegexToolsConfig();

    this.valueControl.valueChanges
      .pipe(debounceTime(this.regexConfig.regexControlDebounceTimeInMs), takeUntilDestroyed())
      .subscribe((value) => {
        if (value !== this.lastWrite) {
          this.onTouchedCallback(value);
          this.onChangeCallback(value);
        }

        this.changeDetectorRef.markForCheck();
        this.lastWrite = null;
      });

    this.testingStringControl.valueChanges
      .pipe(debounceTime(this.regexConfig.regexControlDebounceTimeInMs), takeUntilDestroyed())
      .subscribe(() => this.onValidationChange());
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
      if (this.testingControlOpen()) {
        this.toggleTestingControlVisibility();
      }
    } else {
      this.valueControl.enable();
    }
  }

  public validate(control: AbstractControl<string | null | undefined, string | null | undefined>): ValidationErrors | null {
    let error: ValidationErrors | null = null;
    this.isMatch.set(null);

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
      if (!error && this.testingControlOpen() && testString && testString.length > 0) {
        const isMatch = this.regexToolsService.isMatch(value, testString);
        if (!isMatch) {
          error = {
            test: 'Test string does not match'
          };
        }

        this.isMatch.set(isMatch);
      }
    } else if (this.required()) {
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
    this.testingControlOpen.update((v) => !v);
    this.onValidationChange();
  }
}
