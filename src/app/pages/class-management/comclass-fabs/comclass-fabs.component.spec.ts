import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComclassFabsComponent } from './comclass-fabs.component';

describe('ComclassFabsComponent', () => {
  let component: ComclassFabsComponent;
  let fixture: ComponentFixture<ComclassFabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComclassFabsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComclassFabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
