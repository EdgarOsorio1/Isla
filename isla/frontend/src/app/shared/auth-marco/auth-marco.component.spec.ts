import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthMarcoComponent } from './auth-marco.component';

describe('AuthMarcoComponent', () => {
  let component: AuthMarcoComponent;
  let fixture: ComponentFixture<AuthMarcoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthMarcoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthMarcoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
