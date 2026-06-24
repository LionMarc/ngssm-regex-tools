import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

import { ConsoleAppender } from 'ngssm-store';
import { NgssmRegexComponent, NgssmStringPartsExtractorComponent, StringPartsExtractor } from 'ngssm-regex-tools';
import { FormControl, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';

@Component({
  selector: 'ngssm-root',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
  protected readonly regexRequired = signal<boolean>(false);
  protected readonly regexPattern = signal<string | null | undefined>(undefined);
  protected readonly regexDisabled = signal<boolean>(false);
  protected readonly extractorControl = new FormControl<StringPartsExtractor | undefined>(undefined, Validators.required);
  protected readonly isRegexValid = signal<boolean>(false);

  private readonly consoleAppender = inject(ConsoleAppender);

  constructor() {
    this.consoleAppender.start();

    this.extractorControl.valueChanges.subscribe((v) => {
      console.log('AppComponent - new extractor', v);
    });

    setTimeout(() => {
      this.regexPattern.set('^Test$**');
      console.log('SETTING VALUE', this.regexPattern());
    }, 5000);
  }

  public setRegexDisabled(event: MatCheckboxChange): void {
    this.regexDisabled.set(event.checked);
  }

  public setRegexRequired(event: MatCheckboxChange): void {
    this.regexRequired.set(event.checked);
  }
}
