// TODO: code refactor
import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  TestBed,
  fakeAsync,
} from '@angular/core/testing';
import {
  createTestingModule,
  tickAndDetectChanges,
} from '../../../helpers/test-helpers';
import {
  FormBuilder,
  FormGroup,
  NgForm,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PhoneNumberComponent } from './phone-number.component';
import { provideNgxMask } from 'ngx-mask';
import {
  Component,
  ViewChildren,
  QueryList,
  OnInit,
  Type,
} from '@angular/core';
import { BrowserModule, By } from '@angular/platform-browser';

export function getDebugElement(
  fixture: ComponentFixture<any>,
  componentHtml: string,
  name: string | null = null
) {
  const _selector = name
    ? componentHtml + '[name="' + name + '"]'
    : componentHtml;
  //console.log( 'getDebugElement: ', _selector );
  return fixture.debugElement.query(By.css(_selector));
}

@Component({
  template: '',
})
class PhoneTestComponent {
  @ViewChildren(PhoneNumberComponent) phnComponent:
    | QueryList<PhoneNumberComponent>
    | undefined;
  phoneNumber!: string;

  constructor() {}
}

@Component({
  template: '',
  imports: [PhoneNumberComponent, FormsModule, ReactiveFormsModule],
})
class PhoneReactTestComponent extends PhoneTestComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group({
      phoneNumber: [this.phoneNumber],
    });
  }
}

describe('Phone-Number.Component', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      providers: [provideNgxMask()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PhoneReactTestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should format input correctly with mask', fakeAsync(() => {
    const template = `<form [formGroup]="form">
            <common-phone-number name='phoneNumber'
                                 label='Phone Number'
                                 [displayMask]="true"
                                 formControlName='phoneNumber'
                                 [allowInternational]="false">
            </common-phone-number>
          </form>`;
    const fixture = createTestingModule(PhoneReactTestComponent, template);

    fixture.detectChanges();
    const inputEl = fixture.nativeElement.querySelector('input');

    inputEl.focus();
    inputEl.value = '4165555252';
    inputEl.dispatchEvent(new Event('input'));
    inputEl.dispatchEvent(new Event('change'));
    inputEl.dispatchEvent(new Event('blur'));

    expect(inputEl.value).toBe('(416) 555-5252');
  }));

  it('updates the formControl-bound value when typing into the masked input', fakeAsync(() => {
    const template = `<form [formGroup]="form">
            <common-phone-number name='phoneNumber'
                                 label='Phone Number'
                                 formControlName='phoneNumber'
                                 [allowInternational]="false">
            </common-phone-number>
          </form>`;
    const fixture = createTestingModule(PhoneReactTestComponent, template);

    fixture.detectChanges();
    const inputEl = fixture.nativeElement.querySelector('input');

    inputEl.focus();
    inputEl.value = '4165555252';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Observed: the mask directive unmasks the model value, so the bound
    // control receives the raw digits typed, not the masked display value
    // shown in the input, and never the empty string the old handler wrote.
    expect(fixture.componentInstance.form.get('phoneNumber')!.value).toBe(
      '4165555252'
    );
  }));

  it('should display phone number (default allow international numbers)', fakeAsync(() => {
    const fixture = TestBed.createComponent(PhoneNumberComponent);
    fixture.detectChanges();
    const inputEl = fixture.nativeElement.querySelector('input');

    inputEl.focus();
    inputEl.value = '9055555252';
    inputEl.dispatchEvent(new Event('input'));
    inputEl.dispatchEvent(new Event('change'));
    inputEl.dispatchEvent(new Event('blur'));

    expect(inputEl.value).toBe('+1 (905) 555-5252');
  }));

  it('still updates the formControl-bound value via the input event when displayMask is false', fakeAsync(() => {
    const template = `<form [formGroup]="form">
            <common-phone-number name='phoneNumber'
                                 label='Phone Number'
                                 [displayMask]="false"
                                 formControlName='phoneNumber'>
            </common-phone-number>
          </form>`;
    const fixture = createTestingModule(PhoneReactTestComponent, template);

    fixture.detectChanges();
    const inputEl = fixture.nativeElement.querySelector('input');

    inputEl.focus();
    inputEl.value = '4165555252';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.form.get('phoneNumber')!.value).toBe(
      '4165555252'
    );
  }));

  it('shows the required error message when the control is invalid and touched', fakeAsync(() => {
    const template = `<form [formGroup]="form">
            <common-phone-number name='phoneNumber'
                                 formControlName='phoneNumber'>
            </common-phone-number>
          </form>`;
    const fixture = createTestingModule(PhoneReactTestComponent, template);

    const control = fixture.componentInstance.form.get('phoneNumber')!;
    control.setValidators(Validators.required);
    control.updateValueAndValidity();
    tickAndDetectChanges(fixture);

    control.markAsDirty();
    control.markAsTouched();
    tickAndDetectChanges(fixture);

    const errorContainer = fixture.nativeElement.querySelector(
      'common-error-container'
    );
    expect(errorContainer.textContent).toContain('is required');
  }));
});

@Component({
  template: `
    <form #f="ngForm">
      <common-phone-number
        name="phone"
        [label]="label"
        [required]="required"
        [displayMask]="displayMask"
        [allowInternational]="allowInternational"
        [(ngModel)]="phone"></common-phone-number>
    </form>
  `,
  imports: [PhoneNumberComponent, FormsModule],
})
class PhoneNgModelHostComponent {
  phone: string | number = '';
  label = 'Phone Number (optional)';
  required = false;
  displayMask = true;
  allowInternational = true;
}

describe('Phone-Number.Component self validation', () => {
  let fixture: ComponentFixture<PhoneNgModelHostComponent>;
  let ngForm: NgForm;

  async function setup(
    allowInternational = true,
    configure?: (host: PhoneNgModelHostComponent) => void
  ) {
    TestBed.configureTestingModule({
      imports: [PhoneNgModelHostComponent],
      providers: [provideNgxMask()],
    });
    fixture = TestBed.createComponent(PhoneNgModelHostComponent);
    fixture.componentInstance.allowInternational = allowInternational;
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
    ngForm = fixture.debugElement
      .query(By.directive(NgForm))
      .injector.get(NgForm);
  }

  async function typeDigits(digits: string) {
    const inputEl: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    inputEl.focus();
    inputEl.value = digits;
    inputEl.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();
    inputEl.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function renderedError(): string | null {
    const el = fixture.nativeElement.querySelector('common-error-container');
    return el ? el.textContent.trim() : null;
  }

  ['9876', '3213', '987654321'].forEach((partial) => {
    it(`rejects the partial number ${partial} and renders the message`, async () => {
      await setup();
      await typeDigits(partial);

      const control = ngForm.controls['phone'];
      expect(control.errors).toEqual({ incompleteValue: true });
      expect(ngForm.valid).toBe(false);
      expect(renderedError()).toBe('Phone Number does not appear to be valid.');
    });
  });

  it('accepts an empty value without an error', async () => {
    await setup();
    await typeDigits('');

    expect(ngForm.controls['phone'].errors).toBeNull();
    expect(ngForm.valid).toBe(true);
    expect(renderedError() ?? '').toBe('');
  });

  it('accepts a complete number without an error', async () => {
    await setup();
    await typeDigits('2501234567');

    expect(ngForm.controls['phone'].errors).toBeNull();
    expect(ngForm.valid).toBe(true);
    expect(renderedError() ?? '').toBe('');
  });

  it('accepts a complete number when allowInternational is false', async () => {
    await setup(false);
    await typeDigits('2501234567');

    expect(ngForm.controls['phone'].errors).toBeNull();
    expect(ngForm.valid).toBe(true);
    expect(renderedError() ?? '').toBe('');
  });

  it('treats leftover mask characters as empty on an optional field', async () => {
    await setup();
    await typeDigits('9876');
    expect(ngForm.controls['phone'].errors).toEqual({ incompleteValue: true });

    await typeDigits('+1 (');

    expect(ngForm.controls['phone'].errors).toBeNull();
    expect(ngForm.valid).toBe(true);
    expect(renderedError() ?? '').toBe('');
  });

  it('clears the error when a partial number is removed from an optional field', async () => {
    await setup();
    await typeDigits('9876');
    expect(ngForm.valid).toBe(false);
    expect(renderedError()).toBe('Phone Number does not appear to be valid.');

    await typeDigits('');

    expect(ngForm.controls['phone'].errors).toBeNull();
    expect(ngForm.valid).toBe(true);
    expect(renderedError() ?? '').toBe('');
  });

  it('accepts an optional control cleared with setValue(undefined) after a partial number', async () => {
    await setup();
    await typeDigits('9876');
    const control = ngForm.controls['phone'];
    expect(control.errors).toEqual({ incompleteValue: true });

    control.setValue(undefined);

    expect(control.errors).toBeNull();
    expect(ngForm.valid).toBe(true);
  });

  describe('when required', () => {
    const makeRequired = (host: PhoneNgModelHostComponent) => {
      host.required = true;
      host.label = 'Phone Number';
    };

    it('is invalid with a required error while untouched and empty', async () => {
      await setup(true, makeRequired);

      expect(ngForm.controls['phone'].errors).toEqual({ required: true });
      expect(ngForm.valid).toBe(false);
    });

    it('renders the required message after typing and clearing', async () => {
      await setup(true, makeRequired);
      await typeDigits('9876');
      await typeDigits('');

      expect(ngForm.controls['phone'].errors).toEqual({ required: true });
      expect(ngForm.valid).toBe(false);
      expect(renderedError()).toBe('Phone Number is required.');
    });

    it('renders the required message for leftover mask characters', async () => {
      await setup(true, makeRequired);
      await typeDigits('+1 (');

      expect(ngForm.controls['phone'].errors).toEqual({ required: true });
      expect(ngForm.valid).toBe(false);
      expect(renderedError()).toBe('Phone Number is required.');
    });

    it('rejects a partial number with only the incomplete error', async () => {
      await setup(true, makeRequired);
      await typeDigits('9876');

      expect(ngForm.controls['phone'].errors).toEqual({
        incompleteValue: true,
      });
      expect(ngForm.valid).toBe(false);
      expect(renderedError()).toBe('Phone Number does not appear to be valid.');
    });

    it('accepts a complete number', async () => {
      await setup(true, makeRequired);
      await typeDigits('2501234567');

      expect(ngForm.controls['phone'].errors).toBeNull();
      expect(ngForm.valid).toBe(true);
      expect(renderedError() ?? '').toBe('');
    });
  });

  it('validates a numeric model without throwing', async () => {
    await setup(true, (host) => (host.phone = 2501234567));
    // Observed: without this wait the TypeError from a numeric model is
    // raised after the test has finished, and the test passes anyway.
    await new Promise((resolve) => setTimeout(resolve, 50));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(ngForm.controls['phone'].errors).toBeNull();
    expect(ngForm.valid).toBe(true);
  });

  ['0', '000'].forEach((zeros) => {
    it(`rejects the partial number ${zeros} with a numeric model`, async () => {
      await setup(true, (host) => (host.phone = 2501234567));
      // Observed: without this extra settle, the 0 and 000 tests pass on a
      // validator that treats 0 as empty.
      await fixture.whenStable();
      fixture.detectChanges();

      await typeDigits(zeros);

      expect(ngForm.controls['phone'].errors).toEqual({
        incompleteValue: true,
      });
      expect(ngForm.valid).toBe(false);
      expect(renderedError()).toBe('Phone Number does not appear to be valid.');
    });
  });

  describe('when the mask is not displayed', () => {
    const unmasked = (host: PhoneNgModelHostComponent) => {
      host.displayMask = false;
    };

    it('accepts ten digits separated by dots', async () => {
      await setup(true, unmasked);
      await typeDigits('250.123.4567');

      expect(ngForm.controls['phone'].errors).toBeNull();
      expect(ngForm.valid).toBe(true);
    });

    it('rejects a value with no digits', async () => {
      await setup(true, unmasked);
      await typeDigits('abcdefghij');

      expect(ngForm.controls['phone'].errors).toEqual({
        incompleteValue: true,
      });
      expect(ngForm.valid).toBe(false);
    });
  });
});
