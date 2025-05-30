import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

import { ConsoleAppender } from 'ngssm-store';
import { NgssmRegexComponent, NgssmStringPartsExtractorComponent, StringPartsExtractor } from 'ngssm-regex-tools';

@Component({
  selector: 'ngssm-root',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    NgssmStringPartsExtractorComponent,
    NgssmRegexComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private readonly consoleAppender = inject(ConsoleAppender);
  
  public readonly regexRequired = signal<boolean>(false);
  public readonly regexValue = signal<string | null | undefined>('^Test$**');
  public readonly extractorControl = new FormControl<StringPartsExtractor | undefined>(undefined, Validators.required);
  public readonly regexControl = new FormControl<string | undefined>(undefined);

  constructor() {
    this.consoleAppender.start();

    this.extractorControl.valueChanges.subscribe((v) => {
      console.log('AppComponent - new extractor', v);
    });

    this.regexControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((v) => {
      console.log('regexControl.valueChanges', v);
      setTimeout(() => this.regexValue.set(v));
    });

    setTimeout(() => {
      console.log('SETTING VALUE', this.regexValue());
      this.regexControl.setValue(this.regexValue(), { emitEvent: false });
    }, 5000);
  }

  public setRegexControlDisabled(event: MatCheckboxChange): void {
    if (event.checked) {
      this.regexControl.disable();
    } else {
      this.regexControl.enable();
    }
  }

  public setRegexControlRequired(event: MatCheckboxChange): void {
    this.regexRequired.set(event.checked);
  }
}
