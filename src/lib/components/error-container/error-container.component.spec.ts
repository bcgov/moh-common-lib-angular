import { TestBed } from '@angular/core/testing';
import { ErrorContainerComponent } from './error-container.component';

function createComponent() {
  const fixture = TestBed.createComponent(ErrorContainerComponent);
  const component = fixture.componentInstance;
  return { fixture, component };
}

describe('ErrorContainerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorContainerComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it('should default displayError to false', () => {
    const { component } = createComponent();
    expect(component.displayError).toBe(false);
  });

  it('should not render the alert div when displayError is false', () => {
    const { fixture } = createComponent();
    fixture.detectChanges();
    const el: HTMLElement =
      fixture.nativeElement.querySelector('[role="alert"]');
    expect(el).toBeNull();
  });

  it('should render the alert div when displayError is true', () => {
    const { fixture, component } = createComponent();
    component.displayError = true;
    fixture.detectChanges();
    const el: HTMLElement =
      fixture.nativeElement.querySelector('[role="alert"]');
    expect(el).toBeTruthy();
  });

  it('should apply error--container class when displayError is true', () => {
    const { fixture, component } = createComponent();
    component.displayError = true;
    fixture.detectChanges();
    const el: HTMLElement =
      fixture.nativeElement.querySelector('.error--container');
    expect(el).toBeTruthy();
  });

  it('should remove the alert div when displayError is toggled back to false', () => {
    const { fixture, component } = createComponent();
    component.displayError = true;
    fixture.detectChanges();
    component.displayError = false;
    fixture.detectChanges();
    const el: HTMLElement =
      fixture.nativeElement.querySelector('[role="alert"]');
    expect(el).toBeNull();
  });
});
