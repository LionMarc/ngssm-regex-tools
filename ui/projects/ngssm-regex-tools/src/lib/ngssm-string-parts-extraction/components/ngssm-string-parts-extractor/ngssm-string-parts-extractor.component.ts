import { Component, ChangeDetectionStrategy, Optional, Self, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgSsmComponent, Store } from 'ngssm-store';
import { MatFormFieldControl } from '@angular/material/form-field';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { BehaviorSubject, combineLatest, noop, Observable, Subject } from 'rxjs';
import { StringPartsExtractor } from '../../model';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { EditStringPartsExtractorAction } from '../../actions';
import { selectNgssmStringPartsExtractionState } from '../../state';

@Component({
  selector: 'ngssm-string-parts-extractor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ngssm-string-parts-extractor.component.html',
  styleUrls: ['./ngssm-string-parts-extractor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MatFormFieldControl, useExisting: NgssmStringPartsExtractorComponent }]
})
export class NgssmStringPartsExtractorComponent
  extends NgSsmComponent
  implements MatFormFieldControl<StringPartsExtractor>, ControlValueAccessor
{
  private static nextId = 0;
  private readonly _expression$ = new BehaviorSubject<string | undefined>(undefined);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private onChangeCallback: (_: any) => void = noop;
  private _required = false;
  private _disabled = false;

  @HostBinding('id') public id = `parts-extractor-${NgssmStringPartsExtractorComponent.nextId++}`;
  public controlType = 'ngssm-string-parts-extractor';
  public placeholder = '';
  public focused = false;
  public stateChanges = new Subject<void>();
  public value: StringPartsExtractor | null = null;
  public autofilled?: boolean | undefined;
  public userAriaDescribedBy?: string | undefined;

  constructor(store: Store, @Optional() @Self() public ngControl: NgControl) {
    super(store);

    // Replace the provider from above with this.
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }

    combineLatest([
      this.watch((s) => selectNgssmStringPartsExtractionState(s).stringPartsExtractorEditor.controlId),
      this.watch((s) => selectNgssmStringPartsExtractionState(s).stringPartsExtractorEditor.extractor)
    ]).subscribe((values) => {
      if (values[0] === this.id && values[1]) {
        this.updateValue(values[1]);
      }
    });
  }

  public get empty(): boolean {
    return this.value === null;
  }

  public get shouldLabelFloat(): boolean {
    return this.value !== null;
  }

  @Input()
  public get required(): boolean {
    return this._required;
  }

  public set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  @Input()
  public get disabled(): boolean {
    return this._disabled;
  }

  public set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  public get errorState(): boolean {
    return this.ngControl?.invalid ?? false;
  }

  public get expression$(): Observable<string | undefined> {
    return this._expression$.asObservable();
  }

  public writeValue(obj: StringPartsExtractor | null | undefined): void {
    this.updateValue(obj ?? null);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  public registerOnTouched(fn: any): void {
    // nothing to do for now.
  }

  public setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setDescribedByIds(ids: string[]): void {
    // nothing to do for now
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onContainerClick(event: MouseEvent): void {
    this.dispatchAction(new EditStringPartsExtractorAction(this.id, this.value ?? undefined));
  }

  private updateValue(extractor: StringPartsExtractor | null): void {
    this.value = extractor;
    this.stateChanges.next();
    this._expression$.next(this.value?.expression);
    this.onChangeCallback(this.value);
  }
}
