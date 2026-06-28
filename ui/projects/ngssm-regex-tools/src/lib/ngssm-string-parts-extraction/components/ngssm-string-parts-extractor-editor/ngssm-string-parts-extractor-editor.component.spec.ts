import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgssmStringPartsExtractorEditorComponent } from './ngssm-string-parts-extractor-editor.component';

describe('NgssmStringPartsExtractorEditorComponent', () => {
  let component: NgssmStringPartsExtractorEditorComponent;
  let fixture: ComponentFixture<NgssmStringPartsExtractorEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgssmStringPartsExtractorEditorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NgssmStringPartsExtractorEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
