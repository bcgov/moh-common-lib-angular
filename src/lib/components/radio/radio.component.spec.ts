
// TODO: code refactor
/* eslint-disable @typescript-eslint/no-empty-function */

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
  Validators,
} from '@angular/forms';
import { IRadioItems, RadioComponent } from './radio.component';
import { provideNgxMask } from 'ngx-mask';
import {
  Component,
  DebugElement,
  OnInit,
  Type,
} from '@angular/core';
import {
  tickAndDetectChanges,
  getDebugLegend,
} from '../../../helpers/test-helpers';
import { BrowserModule, By } from '@angular/platform-browser';

// Helper functions for tests
function clickValue(de: DebugElement, value: any) {
  const _de = de.query(By.css('input[value="' + value + '"]'));
  if (_de) {
    _de.nativeElement.click();
  }
}

function getCheckedValue(de: DebugElement) {
  const _de = de.query(By.css('input[type=radio]:checked'));
  return _de ? _de.nativeElement.value : null;
}

function getDebugElement(
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

function getRadioBtnLabel(de: DebugElement, value: any) {
  const _input = de.query(By.css('input[value="' + value + '"]'));
  if (_input) {
    const _label = de.query(
      By.css('label[for="' + _input.nativeElement.id + '"] ')
    );
    return _label ? String(_label.nativeElement.textContent).trim() : null;
  }
  return null;
}

function expectCheckedValue<T>(
  fixture: ComponentFixture<T>,
  debugElement: DebugElement,
  value: string | number | boolean
) {
  const de: DebugElement = debugElement;

  clickValue(de, value);

  tickAndDetectChanges(fixture);

  expect(getCheckedValue(de)).toBe(String(value));
}

function createTestingModule<T>(
  cmp: Type<T>,
  template: string
): ComponentFixture<RadioReactTestComponent> {
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
  ) as ComponentFixture<RadioReactTestComponent>;
}

@Component({
  template: ``,
})
class RadioTestComponent {
  radio1!: boolean;
  radio2!: number;
  radio3!: string;
  radio4!: boolean;

  radioLabel1: string = 'Where you born in Canada?';

  radioLabel2: string = 'Which is a prime number?';
  radioButton2: IRadioItems[] = [
    { label: 'Zero', value: 0 },
    { label: 'One', value: 1 },
    { label: 'Two', value: 2 },
  ];

  radioLabel3: string = 'Which color is your favorite?';
  radioButton3: IRadioItems[] = [
    { label: 'Green', value: 'green' },
    { label: 'Red', value: 'red' },
    { label: 'Yellow', value: 'yellow' },
    { label: 'Pink', value: 'pink' },
    { label: 'Blue', value: 'blue' },
  ];

  radioLabel4: string = 'Do you attend post-secondary school?';

  constructor() {}
}

@Component({
  template: ``,
  imports: [RadioComponent, FormsModule, ReactiveFormsModule],
})
class RadioReactTestComponent extends RadioTestComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group({
      radioBtn1: [this.radio1], // boolean
      radioBtn2: [this.radio2], // number
      radioBtn3: [this.radio3], // string
      radioBtn4: [this.radio4], // boolean
    });
  }

  setBtnRequired(btnName: string) {
    const fld = this.form.controls[btnName];

    fld.setValidators(Validators.required);
    fld.updateValueAndValidity();
  }
}

describe('Radio.Component', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      providers: [provideNgxMask()],
    }).compileComponents();
  });

  it('should create', fakeAsync(() => {
    const fixture = createTestingModule(
      RadioReactTestComponent,
      `<form [formGroup]="form">
            <common-radio name='radioBtn1'
                          label='{{radioLabel1}}'
                          formControlName='radioBtn1'>
            </common-radio>
        </form>`
    );

    const de = getDebugElement(fixture, 'common-radio', 'radioBtn1');
    expect(de).toBeTruthy();
    expect(getDebugLegend(de)).toBe(fixture.componentInstance.radioLabel1);
    expect(getRadioBtnLabel(de, false)).toBe('No');
    expect(getRadioBtnLabel(de, true)).toBe('Yes');
  }));

  it('should have error required', fakeAsync(() => {
    const fixture = createTestingModule(
      RadioReactTestComponent,
      `<form [formGroup]="form">
          <common-radio name='radioBtn4' 
                        label='{{radioLabel4}}'
                        formControlName='radioBtn4'>
          </common-radio>
        </form>`
    );

    fixture.componentInstance.setBtnRequired('radioBtn4');
    tickAndDetectChanges(fixture);

    const de = getDebugElement(fixture, 'common-radio', 'radioBtn4');
    expect(de.componentInstance.controlDir.hasError('required')).toBeTruthy();
  }));

  it('should not have error required', fakeAsync(() => {
    const fixture = createTestingModule(
      RadioReactTestComponent,
      `<form [formGroup]="form">
          <common-radio name='radioBtn4' label='{{radioLabel4}}'
                        formControlName='radioBtn4'></common-radio>
        </form>`
    );
    fixture.componentInstance.setBtnRequired('radioBtn4');
    tickAndDetectChanges(fixture);

    const de = getDebugElement(fixture, 'common-radio', 'radioBtn4');
    expect(de.componentInstance.controlDir.hasError('required')).toBeTruthy();
    clickValue(de, true);

    tickAndDetectChanges(fixture);

    expect(getCheckedValue(de)).toBe('true');
    expect(de.componentInstance.controlDir.hasError('required')).toBeFalsy();
  }));

  it('should create multiple radio components (string, boolean, number)', fakeAsync(() => {
    const fixture = createTestingModule(
      RadioReactTestComponent,
      `<form [formGroup]="form">

          <common-radio name='radioBtn1' label='{{radioLabel1}}'
                        formControlName='radioBtn1'></common-radio>

          <common-radio name='radioBtn2' label='{{radioLabel2}}' [radioLabels]='radioButton2'
                        formControlName='radioBtn2'></common-radio>

          <common-radio name='radioBtn3' label='{{radioLabel3}}' [radioLabels]='radioButton3'
                        formControlName='radioBtn3'></common-radio>

          <common-radio name='radioBtn4' label='{{radioLabel4}}'
                        formControlName='radioBtn4'></common-radio>
        </form>`
    );

    tickAndDetectChanges(fixture);

    const de1 = getDebugElement(fixture, 'common-radio', 'radioBtn1');
    const de2 = getDebugElement(fixture, 'common-radio', 'radioBtn2');
    const de3 = getDebugElement(fixture, 'common-radio', 'radioBtn3');
    const de4 = getDebugElement(fixture, 'common-radio', 'radioBtn4');

    expect(de1).toBeTruthy();
    expect(de2).toBeTruthy();
    expect(de3).toBeTruthy();
    expect(de4).toBeTruthy();
    expect(getDebugLegend(de1)).toBe(fixture.componentInstance.radioLabel1);
    expect(getDebugLegend(de2)).toBe(fixture.componentInstance.radioLabel2);
    expect(getDebugLegend(de3)).toBe(fixture.componentInstance.radioLabel3);
    expect(getDebugLegend(de4)).toBe(fixture.componentInstance.radioLabel4);

    fixture.componentInstance.radioButton2.forEach((element) => {
      expect(getRadioBtnLabel(de2, element.value)).toBe(element.label);
    });

    fixture.componentInstance.radioButton3.forEach((element) => {
      expect(getRadioBtnLabel(de3, element.value)).toBe(element.label);
    });
  }));

  it('should toggle radio button options', fakeAsync(() => {
    const fixture = createTestingModule(
      RadioReactTestComponent,
      `<form [formGroup]="form">
          <common-radio name='radioBtn1' 
                        label='{{radioLabel1}}'
                        formControlName='radioBtn1'>
          </common-radio>

           <common-radio name='radioBtn2' 
                        label='{{radioLabel2}}'
                        [radioLabels]='radioButton2'
                        formControlName='radioBtn2'>
          </common-radio>

           <common-radio name='radioBtn3' 
                        label='{{radioLabel3}}'
                        [radioLabels]='radioButton3'
                        formControlName='radioBtn3'>
          </common-radio>

        </form>`
    );

    // radioBtn1 ==> boolean / true
    expectCheckedValue(fixture, getDebugElement(fixture, 'common-radio', 'radioBtn1'), true);

    // radioBtn2 ==> number / 1
    expectCheckedValue(fixture, getDebugElement(fixture, 'common-radio', 'radioBtn2'), 1);

    // radioBtn3 ==> string / blue
    expectCheckedValue(fixture, getDebugElement(fixture, 'common-radio', 'radioBtn3'), 'blue');
   
  }));
});
