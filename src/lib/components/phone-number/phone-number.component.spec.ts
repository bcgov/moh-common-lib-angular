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
