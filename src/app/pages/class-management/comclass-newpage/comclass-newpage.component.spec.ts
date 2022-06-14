import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComclassNewpageComponent } from './comclass-newpage.component';

describe('ComclassNewpageComponent', () => {
  let component: ComclassNewpageComponent;
  let fixture: ComponentFixture<ComclassNewpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComclassNewpageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComclassNewpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
