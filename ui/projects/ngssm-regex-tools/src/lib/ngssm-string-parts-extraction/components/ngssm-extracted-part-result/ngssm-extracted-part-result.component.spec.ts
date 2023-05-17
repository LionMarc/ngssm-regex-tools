import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgssmExtractedPartResultComponent } from './ngssm-extracted-part-result.component';

describe('NgssmExtractedPartResultComponent', () => {
  let component: NgssmExtractedPartResultComponent;
  let fixture: ComponentFixture<NgssmExtractedPartResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgssmExtractedPartResultComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NgssmExtractedPartResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
