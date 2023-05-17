import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { BehaviorSubject } from 'rxjs';

import { NgssmRegexComponent } from './ngssm-regex.component';

@Component({
  selector: 'ngssm-testing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgssmRegexComponent],
  template: `
    <ngssm-regex [formControl]="regexControl" [required]="(regexRequired$ | async) ?? false">
      Enter a valid regular expression
    </ngssm-regex>
  `,
  styles: []
})
export class TestingComponent {
  public readonly regexControl = new FormControl<string | null>(null);
  public readonly regexRequired$ = new BehaviorSubject<boolean>(false);
}

describe('NgssmRegexComponent', () => {
  let component: TestingComponent;
  let fixture: ComponentFixture<TestingComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestingComponent, NoopAnimationsModule],
      teardown: { destroyAfterEach: false }
    }).compileComponents();

    fixture = TestBed.createComponent(TestingComponent);
    component = fixture.componentInstance;
    fixture.nativeElement.style['min-height'] = '200px';
    loader = TestbedHarnessEnvironment.loader(fixture);
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
