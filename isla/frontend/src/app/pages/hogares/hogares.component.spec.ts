import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HogaresComponent } from './hogares.component';

describe('HogaresComponent', () => {
  let component: HogaresComponent;
  let fixture: ComponentFixture<HogaresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HogaresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HogaresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
