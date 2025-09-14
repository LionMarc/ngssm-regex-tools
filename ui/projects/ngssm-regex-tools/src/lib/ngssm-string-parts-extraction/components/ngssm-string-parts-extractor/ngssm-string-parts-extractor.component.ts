import { Component, ChangeDetectionStrategy, inject, effect, input, booleanAttribute, signal, computed, untracked } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { noop, Subject } from 'rxjs';

import { createSignal, Store } from 'ngssm-store';

import { StringPartsExtractor } from '../../model';
import { EditStringPartsExtractorAction } from '../../actions';
import { selectNgssmStringPartsExtractionState } from '../../state';

@Component({
  selector: 'ngssm-string-parts-extractor',
  imports: [],
  templateUrl: './ngssm-string-parts-extractor.component.html',
  styleUrls: ['./ngssm-string-parts-extractor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MatFormFieldControl, useExisting: NgssmStringPartsExtractorComponent }],
  host: {
    '[id]': 'id'
  }
})
export class NgssmStringPartsExtractorComponent implements MatFormFieldControl<StringPartsExtractor>, ControlValueAccessor {
  private static nextId = 0;

  private readonly store = inject(Store);

  private readonly controlId = createSignal((state) => selectNgssmStringPartsExtractionState(state).stringPartsExtractorEditor.controlId);
  private readonly extractor = createSignal((state) => selectNgssmStringPartsExtractionState(state).stringPartsExtractorEditor.extractor);
  private readonly disabledByCva = signal(false);
  private readonly disabledSignal = computed(() => this.disabledInput() || this.disabledByCva());

  private onChangeCallback: (_: unknown) => void = noop;

  public ngControl = inject(NgControl, { optional: true, self: true });

  public readonly requiredSignal = input<boolean, unknown>(false, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: 'required',
    transform: booleanAttribute
  });
  public readonly disabledInput = input<boolean, unknown>(false, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: 'disabled',
    transform: booleanAttribute
  });

  public readonly expression = signal<string | undefined>(undefined);

  public id = `parts-extractor-${NgssmStringPartsExtractorComponent.nextId++}`;
  public controlType = 'ngssm-string-parts-extractor';
  public placeholder = '';
  public focused = false;
  public stateChanges = new Subject<void>();
  public value: StringPartsExtractor | null = null;
  public autofilled?: boolean | undefined;
  public userAriaDescribedBy?: string | undefined;

  constructor() {
    // Replace the provider from above with this.
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }

    effect(() => {
      const id = this.controlId();
      const extractor = this.extractor();
      if (id === this.id && extractor) {
        this.updateValue(extractor);
      }
    });

    effect(() => {
      // To trigger the effect
      this.requiredSignal();
      this.disabledSignal();

      // Propagate state changes.
      untracked(() => this.stateChanges.next());
    });
  }

  public get empty(): boolean {
    return this.value === null;
  }

  public get shouldLabelFloat(): boolean {
    return this.value !== null;
  }

  public get required(): boolean {
    return this.requiredSignal();
  }

  public get disabled(): boolean {
    return this.disabledSignal();
  }

  public get errorState(): boolean {
    return this.ngControl?.invalid ?? false;
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

  public setDisabledState(isDisabled: boolean): void {
    this.disabledByCva.set(isDisabled);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setDescribedByIds(ids: string[]): void {
    // nothing to do for now
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onContainerClick(event: MouseEvent): void {
    this.store.dispatchAction(new EditStringPartsExtractorAction(this.id, this.value ?? undefined));
  }

  private updateValue(extractor: StringPartsExtractor | null): void {
    this.value = extractor;
    this.stateChanges.next();
    this.expression.set(this.value?.expression);
    this.onChangeCallback(this.value);
  }
}
