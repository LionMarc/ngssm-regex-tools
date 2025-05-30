import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';

import { NgssmRegexComponent } from './ngssm-regex.component';
import { RegexValidationResult } from '../ngssm-string-parts-extraction/model';
import { RegexToolsService } from '../ngssm-string-parts-extraction/services';

@Component({
  selector: 'ngssm-testing',
  imports: [CommonModule, ReactiveFormsModule, NgssmRegexComponent],
  template: ` <ngssm-regex [formControl]="regexControl" [required]="regexRequired()"> Enter a valid regular expression </ngssm-regex> `,
  styles: []
})
export class TestingComponent {
  public readonly regexControl = new FormControl<string | null>(null);
  public readonly regexRequired = signal<boolean>(false);
}

describe('NgssmRegexComponent', () => {
  let component: TestingComponent;
  let fixture: ComponentFixture<TestingComponent>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestingComponent],
      providers: [provideNoopAnimations()],
      teardown: { destroyAfterEach: false }
    }).compileComponents();

    fixture = TestBed.createComponent(TestingComponent);
    component = fixture.componentInstance;
    fixture.nativeElement.style['min-height'] = '200px';
    loader = TestbedHarnessEnvironment.loader(fixture);
    const regexToolsService = TestBed.inject(RegexToolsService);
    spyOn(regexToolsService, 'validateRegex').and.callFake(() => {
      // Mock implementation: returns valid for any input
      return { isValid: true } as RegexValidationResult;
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  beforeEach(async () => {
    component.regexControl.setValue(null);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it(`should render the form field label`, async () => {
    const element = await loader.getHarness(MatFormFieldHarness.with({ selector: '#expressionControl' }));

    const label = await element.getLabel();

    expect(label).toEqual('Enter a valid regular expression');
  });

  it(`should not be able to click on the toggle button when control is disabled`, async () => {
    component.regexControl.disable();
    fixture.detectChanges();
    await fixture.whenStable();

    const element = await loader.getHarness(MatButtonHarness.with({ selector: '#toggleButton' }));

    expect(await element.isDisabled()).toBeTrue();
  });

  it(`should be able to click on the toggle button when control is enabled`, async () => {
    component.regexControl.enable();
    fixture.detectChanges();
    await fixture.whenStable();

    const element = await loader.getHarness(MatButtonHarness.with({ selector: '#toggleButton' }));

    expect(await element.isDisabled()).toBeFalse();
  });

  it(`should not notify change when input form control is reset to the same value as the one in the control`, async () => {
    component.regexControl.setValue('^test.*$');
    fixture.detectChanges();
    await fixture.whenStable();

    let called = false;
    component.regexControl.valueChanges.subscribe(() => (called = true));

    component.regexControl.reset('^test.*$', { emitEvent: false });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(called).toBeFalse();
  });
});
