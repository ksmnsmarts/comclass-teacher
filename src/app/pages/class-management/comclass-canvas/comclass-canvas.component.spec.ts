import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComclassCanvasComponent } from './comclass-canvas.component';

describe('ComclassCanvasComponent', () => {
  let component: ComclassCanvasComponent;
  let fixture: ComponentFixture<ComclassCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComclassCanvasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComclassCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
