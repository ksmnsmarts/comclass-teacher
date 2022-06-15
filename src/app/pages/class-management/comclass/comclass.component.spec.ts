import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComclassComponent } from './comclass.component';

describe('ComclassComponent', () => {
  let component: ComclassComponent;
  let fixture: ComponentFixture<ComclassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComclassComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComclassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
