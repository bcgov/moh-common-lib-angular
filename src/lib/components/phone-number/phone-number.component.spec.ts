// TODO: code refactor
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
import { PhoneNumberComponent } from './phone-number.component';
import { provideNgxMask } from 'ngx-mask';
import {
  Component,
  ViewChildren,
  QueryList,
  OnInit,
  Type,
} from '@angular/core';
import {
  //tickAndDetectChanges /*getDebugLabel*/,
} from '../../../helpers/test-helpers';
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

export function createTestingModule<T>(
  cmp: Type<T>,
  template: string
): ComponentFixture<PhoneReactTestComponent> {
  const importComp: any = [BrowserModule, FormsModule, ReactiveFormsModule];

  TestBed.configureTestingModule({
    declarations: [],
    imports: [importComp],
    providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }],
  }).overrideComponent(cmp, {
    set: {
      template: template,
    },
  });

  TestBed.compileComponents();

  return TestBed.createComponent(
    cmp
  ) as ComponentFixture<PhoneReactTestComponent>;
}

@Component({
  template: ``,
})
class PhoneTestComponent {
  @ViewChildren(PhoneNumberComponent) phnComponent:
    | QueryList<PhoneNumberComponent>
    | undefined;
  phoneNumber!: string;

  constructor() {}
}

@Component({
  template: ``,
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

});

