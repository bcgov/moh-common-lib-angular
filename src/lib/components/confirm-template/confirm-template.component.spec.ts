import { TestBed } from '@angular/core/testing';
import { ConfirmTemplateComponent } from './confirm-template.component';

describe('Confirm-Template.Component', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmTemplateComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ConfirmTemplateComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
