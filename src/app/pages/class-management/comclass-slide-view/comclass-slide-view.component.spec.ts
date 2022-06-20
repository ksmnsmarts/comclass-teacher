import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComclassSlideViewComponent } from './comclass-slide-view.component';

describe('ComclassSlideViewComponent', () => {
  let component: ComclassSlideViewComponent;
  let fixture: ComponentFixture<ComclassSlideViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComclassSlideViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComclassSlideViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
