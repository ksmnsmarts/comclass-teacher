import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComclassThumbComponent } from './comclass-thumb.component';

describe('ComclassThumbComponent', () => {
  let component: ComclassThumbComponent;
  let fixture: ComponentFixture<ComclassThumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComclassThumbComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComclassThumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
