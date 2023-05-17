import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgssmStringPartsExtractorComponent } from './ngssm-string-parts-extractor.component';

describe('NgssmStringPartsExtractorComponent', () => {
  let component: NgssmStringPartsExtractorComponent;
  let fixture: ComponentFixture<NgssmStringPartsExtractorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgssmStringPartsExtractorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NgssmStringPartsExtractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
