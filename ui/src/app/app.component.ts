import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { BehaviorSubject, Observable, takeUntil } from 'rxjs';

import { ConsoleAppender, NgSsmComponent, Store } from 'ngssm-store';
import { NgssmRegexComponent, NgssmStringPartsExtractorComponent, StringPartsExtractor } from 'ngssm-regex-tools';

@Component({
  selector: 'app-root',
  standalone: true,
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
export class AppComponent extends NgSsmComponent {
  private readonly _regexRequired$ = new BehaviorSubject<boolean>(false);
  private readonly _regexValue = new BehaviorSubject<string | null | undefined>('^Test$**');

  public readonly extractorControl = new FormControl<StringPartsExtractor | undefined>(undefined, Validators.required);

  public readonly regexControl = new FormControl<string | undefined>(undefined);

  constructor(store: Store, consoleAppender: ConsoleAppender) {
    super(store);
    consoleAppender.start();

    this.extractorControl.valueChanges.subscribe((v) => {
      console.log('AppComponent - new extractor', v);
    });

    this.regexControl.valueChanges.pipe(takeUntil(this.unsubscribeAll$)).subscribe((v) => {
      console.log('regexControl.valueChanges', v);
      setTimeout(() => this._regexValue.next(v));
    });

    // this._regexValue.pipe(takeUntil(this.unsubscribeAll$)).subscribe((v) => {
    //   console.log('state', v);
    //   this.regexControl.reset(v, { emitEvent: false });
    // });

    setTimeout(() => {
      console.log('SETTING VALUE', this._regexValue.getValue());
      this.regexControl.setValue(this._regexValue.getValue(), { emitEvent: false });
    }, 5000);
  }

  public get regexRequired$(): Observable<boolean> {
    return this._regexRequired$.asObservable();
  }

  public setRegexControlDisabled(event: MatCheckboxChange): void {
    if (event.checked) {
      this.regexControl.disable();
    } else {
      this.regexControl.enable();
    }
  }

  public setRegexControlRequired(event: MatCheckboxChange): void {
    this._regexRequired$.next(event.checked);
  }
}
