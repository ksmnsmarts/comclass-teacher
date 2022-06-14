import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComclassStudentComponent } from './comclass-student.component';

describe('ComclassStudentComponent', () => {
  let component: ComclassStudentComponent;
  let fixture: ComponentFixture<ComclassStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComclassStudentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComclassStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
