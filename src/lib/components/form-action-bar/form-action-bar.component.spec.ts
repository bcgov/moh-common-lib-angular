import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormActionBarComponent } from './form-action-bar.component';
import * as scrollHelpers from '../../../helpers/scroll-helpers';

function createComponent(): {
  fixture: ComponentFixture<FormActionBarComponent>;
  component: FormActionBarComponent;
} {
  const fixture = TestBed.createComponent(FormActionBarComponent);
  return { fixture, component: fixture.componentInstance };
}

function clickEvent(): MouseEvent {
  return new MouseEvent('click', { bubbles: true, cancelable: true });
}

describe('FormActionBarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormActionBarComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it('should default its inputs', () => {
    const { component } = createComponent();
    expect(component.submitLabel).toBe('Continue');
    expect(component.canContinue).toBe(true);
    expect(component.isLoading).toBe(false);
    expect(component.defaultColor).toBe(true);
    expect(component.scrollToErrorsOnSubmit).toBe(true);
  });

  it('should render submitLabel on the button', () => {
    const { fixture, component } = createComponent();
    component.submitLabel = 'Submit application';
    fixture.detectChanges();
    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(button.textContent?.trim()).toBe('Submit application');
  });

  it('should use btn-primary when defaultColor is true', () => {
    const { fixture } = createComponent();
    fixture.detectChanges();
    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(button.classList).toContain('btn-primary');
  });

  it('should use btn-secondary when defaultColor is false', () => {
    const { fixture, component } = createComponent();
    component.defaultColor = false;
    fixture.detectChanges();
    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(button.classList).toContain('btn-secondary');
  });

  it('should mark the bar disabled when canContinue is false', () => {
    const { fixture, component } = createComponent();
    component.canContinue = false;
    fixture.detectChanges();
    const bar: HTMLElement =
      fixture.nativeElement.querySelector('.form-action-bar');
    expect(bar.classList).toContain('disabled');
  });

  it('should show the spinner instead of the label while loading', () => {
    const { fixture, component } = createComponent();
    component.isLoading = true;
    fixture.detectChanges();
    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(button.querySelector('.fa-spinner')).toBeTruthy();
    expect(button.textContent?.trim()).toBe('');
  });

  it('should emit btnClick when clicked', () => {
    const { component } = createComponent();
    const emitted: MouseEvent[] = [];
    component.btnClick.subscribe((e) => emitted.push(e));
    component.onClick(clickEvent());
    expect(emitted.length).toBe(1);
  });

  it('should not emit btnClick when canContinue is false', () => {
    const { component } = createComponent();
    component.canContinue = false;
    const emitted: MouseEvent[] = [];
    component.btnClick.subscribe((e) => emitted.push(e));
    component.onClick(clickEvent());
    expect(emitted.length).toBe(0);
  });

  it('should not emit btnClick while loading', () => {
    const { component } = createComponent();
    component.isLoading = true;
    const emitted: MouseEvent[] = [];
    component.btnClick.subscribe((e) => emitted.push(e));
    component.onClick(clickEvent());
    expect(emitted.length).toBe(0);
  });

  it('should emit btnClick when the button is clicked in the template', () => {
    const { fixture, component } = createComponent();
    fixture.detectChanges();
    const emitted: MouseEvent[] = [];
    component.btnClick.subscribe((e) => emitted.push(e));
    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    button.click();
    expect(emitted.length).toBe(1);
  });

  it('should stop propagation and return false', () => {
    const { component } = createComponent();
    const event = clickEvent();
    const stopPropagation = jest.spyOn(event, 'stopPropagation');
    const result = component.onClick(event);
    expect(stopPropagation).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should scroll to the first error after submitting', fakeAsync(() => {
    const scrollToError = jest
      .spyOn(scrollHelpers, 'scrollToError')
      .mockImplementation(() => undefined);
    const { component } = createComponent();
    component.onClick(clickEvent());
    tick(50);
    expect(scrollToError).toHaveBeenCalled();
    scrollToError.mockRestore();
  }));

  it('should not scroll to errors when scrollToErrorsOnSubmit is false', fakeAsync(() => {
    const scrollToError = jest
      .spyOn(scrollHelpers, 'scrollToError')
      .mockImplementation(() => undefined);
    const { component } = createComponent();
    component.scrollToErrorsOnSubmit = false;
    component.onClick(clickEvent());
    tick(50);
    expect(scrollToError).not.toHaveBeenCalled();
    scrollToError.mockRestore();
  }));
});
