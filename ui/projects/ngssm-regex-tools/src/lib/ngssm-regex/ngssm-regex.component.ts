import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  inject,
  input,
  booleanAttribute,
  model,
  signal,
  effect,
  output
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectionPositionPair } from '@angular/cdk/overlay';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { debounceTime } from 'rxjs';

import { RegexToolsService } from '../ngssm-string-parts-extraction/services';
import { NGSSM_REGEX_TOOLS_CONFIG, NgssmRegexToolsConfig, getDefaultNgssmRegexToolsConfig } from '../ngssm-regex-tools-tools-config';

@Component({
  selector: 'ngssm-regex',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatSuffix,
    MatInput,
    MatIcon,
    MatIconButton,
    MatTooltip,
    CdkConnectedOverlay,
    CdkOverlayOrigin
  ],
  templateUrl: './ngssm-regex.component.html',
  styleUrls: ['./ngssm-regex.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgssmRegexComponent {
  public readonly pattern = model<string | null | undefined>(null);
  public readonly required = input<boolean, unknown>(false, {
    transform: booleanAttribute
  });
  public readonly label = input<string>('Pattern');
  public readonly isDisabled = input<boolean, unknown>(false, {
    transform: booleanAttribute
  });
  public readonly isValidChanged = output<boolean>();

  protected readonly elementRef = inject(ElementRef);
  protected readonly patternControl = new FormControl<string | undefined>(undefined);
  protected readonly testingControlOpen = signal<boolean>(false);
  protected readonly isMatch = signal<boolean | null>(null);
  protected readonly validationError = signal<string | null>(null);
  protected readonly testingStringControl = new FormControl<string>('');
  protected readonly overlayPositions: ConnectionPositionPair[] = [
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

  private readonly regexToolsService = inject(RegexToolsService);
  private readonly config: NgssmRegexToolsConfig | null = inject(NGSSM_REGEX_TOOLS_CONFIG, { optional: true });
  private readonly regexConfig: NgssmRegexToolsConfig;
  private readonly testString = signal<string>('');

  constructor() {
    this.regexConfig = this.config ?? getDefaultNgssmRegexToolsConfig();

    // Handle disabled state
    effect(() => {
      if (this.isDisabled()) {
        if (this.testingControlOpen()) {
          this.toggleTestingControlVisibility();
        }

        this.patternControl.disable();
      } else {
        this.patternControl.enable();
      }
    });

    effect(() => {
      const value = this.pattern();
      this.patternControl.setValue(value, { emitEvent: false });
    });

    effect(() => {
      const error = this.validationError();
      if (error) {
        this.patternControl.setErrors({ regex: error });
      } else {
        this.patternControl.setErrors(null);
      }
    });

    this.patternControl.valueChanges.subscribe((v) => this.pattern.set(v));

    // Validate pattern and test string
    effect(() => {
      const patternValue = this.pattern();
      const testString = this.testString();

      this.isMatch.set(null);
      this.validationError.set(null);

      if (patternValue) {
        const result = this.regexToolsService.validateRegex(patternValue);
        if (!result.isValid) {
          this.validationError.set(result.error ?? 'Invalid regex');
          this.isValidChanged.emit(false);
          return;
        }

        // Check test string only if testing control is open
        if (this.testingControlOpen() && testString && testString.length > 0) {
          const matchResult = this.regexToolsService.isMatch(patternValue, testString);
          this.isMatch.set(matchResult);
          if (!matchResult) {
            this.validationError.set('Test string does not match');
            this.isValidChanged.emit(false);
            return;
          }
        }
      } else if (this.required()) {
        this.validationError.set('Value is required');
        this.isValidChanged.emit(false);
        return;
      }

      this.isValidChanged.emit(true);
    });

    // Debounce pattern updates
    this.testingStringControl.valueChanges
      .pipe(debounceTime(this.regexConfig.regexControlDebounceTimeInMs), takeUntilDestroyed())
      .subscribe((v) => {
        this.testString.set(v ?? '');
      });
  }

  public toggleTestingControlVisibility(): void {
    this.testingControlOpen.update((v) => !v);
  }
}
