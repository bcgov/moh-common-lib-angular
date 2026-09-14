import { FormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { CheckboxComponent } from './checkbox.component';
import { waitForAsync } from '@angular/core/testing';

function createCheckboxComponent() {
  const fixture = TestBed.createComponent(CheckboxComponent);
  const component = fixture.componentInstance;
  const element = fixture.nativeElement;
  const checkBoxQuerySelector =
    fixture.debugElement.nativeElement.querySelector('input[type=checkbox]');

  return { fixture, component, element, checkBoxQuerySelector };
}

describe('Checkbox.Component', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent, FormsModule],
    }).compileComponents();
  });

  // Test for component creation
  it('Should create', () => {
    const { component } = createCheckboxComponent();
    expect(component).toBeTruthy();
  });

  // Test for checkbox label input
  it('Checkbox label is displayed', () => {
    const { component, fixture } = createCheckboxComponent();
    component.label = 'Checkbox';
    fixture.detectChanges();
    const label: HTMLLabelElement =
      fixture.nativeElement.querySelector('label');
    expect(label.textContent?.trim()).toEqual('Checkbox');
  });

  it('Checkbox label points at the input it labels', () => {
    const { fixture } = createCheckboxComponent();
    fixture.detectChanges();
    const label: HTMLLabelElement =
      fixture.nativeElement.querySelector('label');
    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[type="checkbox"]'
    );
    expect(label.getAttribute('for')).toBe(input.id);
  });

  // Test for checkbox checked state
  it('Checkbox is checked', waitForAsync(() => {
    const { component, fixture, checkBoxQuerySelector } =
      createCheckboxComponent();
    component.data = true;

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(checkBoxQuerySelector.checked).toBe(true);
    });
  }));
});
