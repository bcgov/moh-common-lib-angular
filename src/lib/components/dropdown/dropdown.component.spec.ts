import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  TestBed,
  fakeAsync,
} from '@angular/core/testing';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Component, ViewChildren, QueryList, OnInit } from '@angular/core';
import {
  createTestingModule,
  tickAndDetectChanges,
  getDebugElement,
  getDebugLabel,
} from '../../../helpers/test-helpers';
import { By } from '@angular/platform-browser';
import { DropdownComponent } from './dropdown.component';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  template: '',
})
class DropdownTestComponent {
  @ViewChildren(DropdownComponent)
  dropdownComponent!: QueryList<DropdownComponent>;

  option1!: string;

  defaultLabel = 'Select an option';
  items: string[] = ['Option A', 'Option B', 'Option C'];
}

@Component({
  template: '',
  imports: [
    DropdownComponent,
    FormsModule,
    ReactiveFormsModule,
    NgSelectComponent,
  ],
})
class DropdownReactTestComponent
  extends DropdownTestComponent
  implements OnInit
{
  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group({
      option1: [this.option1],
    });
  }

  setOption1Required() {
    this.form.controls['option1'].setValidators((c) =>
      c.value ? null : { required: true }
    );
    this.form.controls['option1'].updateValueAndValidity();
  }
}

// Object items are set as a class field (rather than assigned onto the
// fixture after creation) so the value is present before the first change
// detection pass binds [items].
const OBJECT_ITEMS = [
  { label: 'Employees', value: 'EMPLOYEES' },
  { label: 'Contractors', value: 'CONTRACTORS' },
];

@Component({
  template: '',
  imports: [
    DropdownComponent,
    FormsModule,
    ReactiveFormsModule,
    NgSelectComponent,
  ],
})
class DropdownObjectItemsTestComponent implements OnInit {
  @ViewChildren(DropdownComponent)
  dropdownComponent!: QueryList<DropdownComponent>;

  items = OBJECT_ITEMS;
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      option1: [null],
    });
  }
}

/**
 * Drives ng-select through its real UI: opens the dropdown and clicks the
 * rendered .ng-option whose label matches, exercising the component's real
 * (ngModelChange)="onValueChange($event)" binding instead of calling
 * onValueChange() directly.
 */
function selectOptionThroughUi(
  fixture: ComponentFixture<any>,
  dropdownDe: any,
  optionLabel: string
): void {
  const ngSelectDe = dropdownDe.query(By.directive(NgSelectComponent));
  const ngSelectCmp = ngSelectDe.componentInstance as NgSelectComponent;
  ngSelectCmp.open();
  tickAndDetectChanges(fixture);

  const optionEls: HTMLElement[] = Array.from(
    fixture.nativeElement.querySelectorAll('.ng-option')
  );
  const optionEl = optionEls.find(
    (el) => el.textContent?.trim() === optionLabel
  );
  if (!optionEl) {
    throw new Error(
      `ng-option "${optionLabel}" not found in rendered dropdown`
    );
  }
  optionEl.click();
  tickAndDetectChanges(fixture);
}

describe('Dropdown.Component', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ErrorContainerComponent],
    }).compileComponents();
  });

  it('should create', fakeAsync(() => {
    const fixture = createTestingModule(
      DropdownReactTestComponent,
      `<form [formGroup]="form">
          <common-dropdown
            name='option1'
            formControlName='option1'
            [items]='items'>
          </common-dropdown>
      </form>`
    );

    const component = fixture.componentInstance;
    tickAndDetectChanges(fixture);
    const de = getDebugElement(fixture, 'common-dropdown', 'option1');
    const label = getDebugLabel(de, de.componentInstance.labelforId);

    expect(component.dropdownComponent).toBeTruthy();
    expect(label).toBe(component.defaultLabel);
  }));

  it('selects an option through the real ng-select UI and updates the form control', fakeAsync(() => {
    const fixture = createTestingModule(
      DropdownReactTestComponent,
      `<form [formGroup]="form">
          <common-dropdown
            name='option1'
            formControlName='option1'
            [items]='items'>
          </common-dropdown>
      </form>`
    );

    tickAndDetectChanges(fixture);
    const de = getDebugElement(fixture, 'common-dropdown', 'option1');

    selectOptionThroughUi(fixture, de, 'Option B');

    const option1Control = fixture.componentInstance.form.get('option1');
    expect(option1Control?.value).toBe('Option B');
  }));

  it('reports a required error until an option is selected', fakeAsync(() => {
    const fixture = createTestingModule(
      DropdownReactTestComponent,
      `<form [formGroup]="form">
          <common-dropdown
            name='option1'
            formControlName='option1'
            [items]='items'>
          </common-dropdown>
      </form>`
    );

    fixture.componentInstance.setOption1Required();
    tickAndDetectChanges(fixture);

    const de = getDebugElement(fixture, 'common-dropdown', 'option1');
    expect(de.componentInstance.controlDir.hasError('required')).toBeTruthy();

    selectOptionThroughUi(fixture, de, 'Option A');
    expect(de.componentInstance.controlDir.hasError('required')).toBeFalsy();
  }));

  it('writeValue sets the selected option without throwing', () => {
    const fixture = TestBed.createComponent(DropdownComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(() => component.writeValue('Option C')).not.toThrow();
    expect(component.value).toBe('Option C');
  });

  // ng-select gets no bindValue override here, so the value ng-select emits IS
  // the whole selected item object, and the visible text comes from its
  // .label property (ng-select's own default bindLabel). If dropdown.component.ts
  // added a bindValue (e.g. 'value'), the control would hold the string
  // 'CONTRACTORS' instead of the object, and the first assertion below would fail.
  it('uses the whole object as the form control value and item.label for display when items are objects', fakeAsync(() => {
    const fixture = createTestingModule(
      DropdownObjectItemsTestComponent,
      `<form [formGroup]="form">
          <common-dropdown
            name='option1'
            formControlName='option1'
            [items]='items'>
          </common-dropdown>
      </form>`
    );

    tickAndDetectChanges(fixture);
    const de = getDebugElement(fixture, 'common-dropdown', 'option1');

    selectOptionThroughUi(fixture, de, 'Contractors');

    const option1Control = fixture.componentInstance.form.get('option1');
    expect(option1Control?.value).toEqual({
      label: 'Contractors',
      value: 'CONTRACTORS',
    });

    const displayedLabel = fixture.nativeElement
      .querySelector('.ng-value-label')
      ?.textContent?.trim();
    expect(displayedLabel).toBe('Contractors');
  }));

  it('disables the inner ng-select and hides the error display when the form control is disabled', fakeAsync(() => {
    const fixture = createTestingModule(
      DropdownReactTestComponent,
      `<form [formGroup]="form">
          <common-dropdown
            name='option1'
            formControlName='option1'
            [items]='items'>
          </common-dropdown>
      </form>`
    );

    fixture.componentInstance.setOption1Required();
    const option1Control = fixture.componentInstance.form.get('option1');
    option1Control?.markAsTouched();
    tickAndDetectChanges(fixture);

    const de = getDebugElement(fixture, 'common-dropdown', 'option1');

    // Confirm the error is visible before disabling, so that it disappearing
    // afterwards is attributable to disable(), not some other precondition.
    expect(
      fixture.nativeElement.querySelector(
        'common-error-container .error--container'
      )
    ).toBeTruthy();

    option1Control?.disable();
    tickAndDetectChanges(fixture);

    const ngSelectCmp = de.query(By.directive(NgSelectComponent))
      .componentInstance as NgSelectComponent;
    expect(ngSelectCmp.disabled).toBe(true);
    expect(
      fixture.nativeElement.querySelector(
        'common-error-container .error--container'
      )
    ).toBeFalsy();
  }));

  it('marks the form control touched when the inner ng-select input blurs, through a real DOM blur event', fakeAsync(() => {
    const fixture = createTestingModule(
      DropdownReactTestComponent,
      `<form [formGroup]="form">
          <common-dropdown
            name='option1'
            formControlName='option1'
            [items]='items'>
          </common-dropdown>
      </form>`
    );

    tickAndDetectChanges(fixture);
    const option1Control = fixture.componentInstance.form.get('option1');
    expect(option1Control?.touched).toBe(false);

    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector(
      'common-dropdown .ng-input input'
    );
    inputEl.dispatchEvent(new Event('blur'));
    tickAndDetectChanges(fixture);

    expect(option1Control?.touched).toBe(true);
  }));

  it('emits valueChange once on a user selection, and not when writeValue sets the value', fakeAsync(() => {
    const fixture = createTestingModule(
      DropdownReactTestComponent,
      `<form [formGroup]="form">
          <common-dropdown
            name='option1'
            formControlName='option1'
            [items]='items'>
          </common-dropdown>
      </form>`
    );

    tickAndDetectChanges(fixture);
    const de = getDebugElement(fixture, 'common-dropdown', 'option1');
    const dropdown = de.componentInstance as DropdownComponent;
    const valueChangeSpy = jest.fn();
    dropdown.valueChange.subscribe(valueChangeSpy);

    // setValue() on the outer FormControl drives the value down through
    // writeValue() (the ControlValueAccessor path), not through the user
    // selecting an option - it must not echo back out through valueChange.
    fixture.componentInstance.form.get('option1')?.setValue('Option C');
    tickAndDetectChanges(fixture);
    expect(valueChangeSpy).not.toHaveBeenCalled();

    selectOptionThroughUi(fixture, de, 'Option A');
    expect(valueChangeSpy).toHaveBeenCalledTimes(1);
    expect(valueChangeSpy).toHaveBeenCalledWith('Option A');
  }));

  it('renders the required error text once the control is dirty or touched, and hides it while pristine and untouched', fakeAsync(() => {
    const fixture = createTestingModule(
      DropdownReactTestComponent,
      `<form [formGroup]="form">
          <common-dropdown
            name='option1'
            formControlName='option1'
            [items]='items'>
          </common-dropdown>
      </form>`
    );

    fixture.componentInstance.setOption1Required();
    const option1Control = fixture.componentInstance.form.get('option1');
    tickAndDetectChanges(fixture);

    expect(
      fixture.nativeElement.querySelector(
        'common-error-container .error--container'
      )
    ).toBeFalsy();

    option1Control?.markAsDirty();
    tickAndDetectChanges(fixture);
    let errorEl = fixture.nativeElement.querySelector(
      'common-error-container .error--container'
    );
    expect(errorEl?.textContent?.trim()).toBe('Select an option is required.');

    option1Control?.markAsPristine();
    option1Control?.markAsTouched();
    tickAndDetectChanges(fixture);
    errorEl = fixture.nativeElement.querySelector(
      'common-error-container .error--container'
    );
    expect(errorEl?.textContent?.trim()).toBe('Select an option is required.');
  }));
});
