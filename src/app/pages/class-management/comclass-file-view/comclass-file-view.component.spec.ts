import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComclassFileViewComponent } from './comclass-file-view.component';

describe('ComclassFileViewComponent', () => {
  let component: ComclassFileViewComponent;
  let fixture: ComponentFixture<ComclassFileViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComclassFileViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComclassFileViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
