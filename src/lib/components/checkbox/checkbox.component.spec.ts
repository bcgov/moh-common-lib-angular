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
  it(`Checkbox label is displayed`, () => {
    const { element } = createCheckboxComponent();
    element.label = 'Checkbox';
    expect(element.label).toEqual('Checkbox');
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
