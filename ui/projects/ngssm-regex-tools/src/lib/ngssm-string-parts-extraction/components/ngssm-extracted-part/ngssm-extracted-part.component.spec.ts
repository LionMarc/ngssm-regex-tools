import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatAutocompleteHarness } from '@angular/material/autocomplete/testing';
import { By } from '@angular/platform-browser';

import { ExtractedPartType, getDefaultNgssmRegexToolsDateFormats } from 'ngssm-regex-tools';
import { Store, StoreMock } from 'ngssm-store';

import { NgssmStringPartsExtractionStateSpecification, updateNgssmStringPartsExtractionState } from '../../state';
import { NgssmExtractedPartComponent } from './ngssm-extracted-part.component';
import { NGSSM_REGEX_TOOLS_DATE_FORMATS } from '../../model';

describe('NgssmExtractedPartComponent', () => {
  let component: NgssmExtractedPartComponent;
  let fixture: ComponentFixture<NgssmExtractedPartComponent>;
  let store: StoreMock;
  let loader: HarnessLoader;

  const defaultInitialization = () => {
    beforeEach(async () => {
      store = new StoreMock({
        [NgssmStringPartsExtractionStateSpecification.featureStateKey]: NgssmStringPartsExtractionStateSpecification.initialState
      });

      await TestBed.configureTestingModule({
        imports: [NoopAnimationsModule, NgssmExtractedPartComponent],
        providers: [{ provide: Store, useValue: store }],
        teardown: { destroyAfterEach: false }
      }).compileComponents();

      fixture = TestBed.createComponent(NgssmExtractedPartComponent);
      component = fixture.componentInstance;
      fixture.nativeElement.style['min-height'] = '200px';
      loader = TestbedHarnessEnvironment.loader(fixture);
      fixture.detectChanges();
    });
  };

  const customDateFormats = ['yyyy-MM-dd', 'yyyy/MM/dd'];
  const withCustomFormats = () => {
    beforeEach(async () => {
      store = new StoreMock({
        [NgssmStringPartsExtractionStateSpecification.featureStateKey]: NgssmStringPartsExtractionStateSpecification.initialState
      });

      await TestBed.configureTestingModule({
        imports: [NoopAnimationsModule, NgssmExtractedPartComponent],
        providers: [
          { provide: Store, useValue: store },
          { provide: NGSSM_REGEX_TOOLS_DATE_FORMATS, useValue: customDateFormats }
        ],
        teardown: { destroyAfterEach: false }
      }).compileComponents();

      fixture = TestBed.createComponent(NgssmExtractedPartComponent);
      component = fixture.componentInstance;
      fixture.nativeElement.style['min-height'] = '200px';
      loader = TestbedHarnessEnvironment.loader(fixture);
      fixture.detectChanges();
    });
  };

  describe(`Extracted part of type '${ExtractedPartType.date}'`, () => {
    describe(`with default date formats`, () => {
      defaultInitialization();

      beforeEach(async () => {
        const state = updateNgssmStringPartsExtractionState(store.state$.getValue(), {
          stringPartsExtractorEditor: {
            parts: {
              $set: [
                {
                  name: 'date',
                  type: ExtractedPartType.date,
                  format: 'yyyyMMdd'
                }
              ]
            }
          }
        });
        store.state$.next(state);
        component.partName = 'date';
        fixture.detectChanges();
        await fixture.whenStable();
      });

      it('should render an input to setup the date format', async () => {
        const element = fixture.debugElement.query(By.css('#formatInput'));

        expect(element).toBeTruthy();
      });

      it('should render the format of the part', async () => {
        const element = await loader.getHarness(MatInputHarness.with({ selector: '#formatInput' }));

        const value = await element.getValue();

        expect(value).toEqual('yyyyMMdd');
      });

      it('should render the default date formats list', async () => {
        const element = await loader.getHarness(MatInputHarness.with({ selector: '#formatInput' }));
        await element.setValue('');

        const autocomplete = await loader.getHarness(MatAutocompleteHarness);
        await autocomplete.focus();

        const options = await autocomplete.getOptions();
        const defaultFormats = getDefaultNgssmRegexToolsDateFormats();
        expect(options.length).toEqual(defaultFormats.length);
        for (let i = 0; i < defaultFormats.length; i++) {
          expect(await options[i].getText()).toEqual(defaultFormats[i]);
        }
      });
    });

    describe(`with custom date formats`, () => {
      withCustomFormats();

      beforeEach(async () => {
        const state = updateNgssmStringPartsExtractionState(store.state$.getValue(), {
          stringPartsExtractorEditor: {
            parts: {
              $set: [
                {
                  name: 'date',
                  type: ExtractedPartType.date,
                  format: 'yyyyMMdd'
                }
              ]
            }
          }
        });
        store.state$.next(state);
        component.partName = 'date';
        fixture.detectChanges();
        await fixture.whenStable();
      });

      it('should render an input to setup the date format', async () => {
        const element = fixture.debugElement.query(By.css('#formatInput'));

        expect(element).toBeTruthy();
      });

      it('should render the format of the part', async () => {
        const element = await loader.getHarness(MatInputHarness.with({ selector: '#formatInput' }));

        const value = await element.getValue();

        expect(value).toEqual('yyyyMMdd');
      });

      it('should render the default date formats list', async () => {
        const element = await loader.getHarness(MatInputHarness.with({ selector: '#formatInput' }));
        await element.setValue('');

        const autocomplete = await loader.getHarness(MatAutocompleteHarness);
        await autocomplete.focus();

        const options = await autocomplete.getOptions();
        expect(options.length).toEqual(customDateFormats.length);
        for (let i = 0; i < customDateFormats.length; i++) {
          expect(await options[i].getText()).toEqual(customDateFormats[i]);
        }
      });
    });
  });
});
