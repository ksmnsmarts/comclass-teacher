import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComclassNavComponent } from './comclass-nav.component';

describe('ComclassNavComponent', () => {
  let component: ComclassNavComponent;
  let fixture: ComponentFixture<ComclassNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComclassNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComclassNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
