import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { PostalCodeComponent } from './postal-code.component';
import {
  commonValidatePostalcode,
  ValidatePostalcodeDirective,
} from './validate-postalcode.directive';

@Component({
  template: `
    <form [formGroup]="form">
      <common-postal-code
        name="pc"
        formControlName="pc"
        [label]="label"
        [displayMask]="displayMask"></common-postal-code>
    </form>
  `,
  imports: [
    PostalCodeComponent,
    FormsModule,
    ReactiveFormsModule,
    ValidatePostalcodeDirective,
  ],
})
class HostComponent implements OnInit {
  @ViewChild(PostalCodeComponent) postalCode!: PostalCodeComponent;

  form!: FormGroup;
  label = 'Postal Code';
  displayMask = true;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({ pc: [''] });
  }

  setValidator(validator: ValidatorFn | ValidatorFn[]) {
    const control = this.form.controls['pc'];
    control.setValidators(validator);
    control.updateValueAndValidity();
  }
}

function createHost(): ComponentFixture<HostComponent> {
  TestBed.configureTestingModule({
    imports: [HostComponent],
    providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }],
  });
  return TestBed.createComponent(HostComponent);
}

describe('PostalCodeComponent', () => {
  function control(fixture: ComponentFixture<HostComponent>) {
    return fixture.componentInstance.form.controls['pc'];
  }

  function input(fixture: ComponentFixture<HostComponent>): HTMLInputElement {
    return fixture.debugElement.query(By.css('input')).nativeElement;
  }

  it('should create', fakeAsync(() => {
    const fixture = createHost();
    tick();
    expect(fixture.componentInstance.postalCode).toBeTruthy();
  }));

  it('should default its inputs', fakeAsync(() => {
    const fixture = createHost();
    tick();
    const component = fixture.componentInstance.postalCode;
    expect(component.label).toBe('Postal Code');
    expect(component.displayMask).toBe(true);
    expect(component.maxlen).toBe('250');
    expect(component.required).toBe(false);
    expect(component.mask).toBe('S0S 0S0');
  }));

  it('should render the label bound to the input', fakeAsync(() => {
    const fixture = createHost();
    tick();
    const label: HTMLLabelElement = fixture.debugElement.query(
      By.css('label')
    ).nativeElement;
    expect(label.textContent?.trim()).toBe('Postal Code');
    expect(label.getAttribute('for')).toBe(input(fixture).getAttribute('id'));
  }));

  it('should write a value from the form into the field', fakeAsync(() => {
    const fixture = createHost();
    tick();
    control(fixture).setValue('V8V 1X4');
    tick();
    fixture.detectChanges();
    expect(fixture.componentInstance.postalCode.postalCode).toBe('V8V 1X4');
  }));

  it('should upper case the value written by the user', fakeAsync(() => {
    const fixture = createHost();
    tick();
    fixture.componentInstance.postalCode.onValueChange('v8v 1x4');
    expect(fixture.componentInstance.postalCode.postalCode).toBe('V8V 1X4');
  }));

  it('should emit the upper cased value through valueChange', fakeAsync(() => {
    const fixture = createHost();
    tick();
    const emitted: string[] = [];
    fixture.componentInstance.postalCode.valueChange.subscribe((v) =>
      emitted.push(v)
    );
    fixture.componentInstance.postalCode.onValueChange('v8v 1x4');
    expect(emitted).toEqual(['V8V 1X4']);
  }));

  it('should not emit when the upper cased value is unchanged', fakeAsync(() => {
    const fixture = createHost();
    tick();
    const component = fixture.componentInstance.postalCode;
    component.onValueChange('V8V 1X4');
    const emitted: string[] = [];
    component.valueChange.subscribe((v) => emitted.push(v));
    component.onValueChange('v8v 1x4');
    expect(emitted).toEqual([]);
  }));

  it('should emit blurEvent on blur', fakeAsync(() => {
    const fixture = createHost();
    tick();
    let blurred = false;
    fixture.componentInstance.postalCode.blurEvent.subscribe(
      () => (blurred = true)
    );
    input(fixture).dispatchEvent(new Event('blur'));
    tick();
    expect(blurred).toBe(true);
  }));

  it('should expose the value through the value getter and setter', fakeAsync(() => {
    const fixture = createHost();
    tick();
    fixture.componentInstance.postalCode.value = 'V8V 1X4';
    expect(fixture.componentInstance.postalCode.value).toBe('V8V 1X4');
  }));

  it('should ignore an empty value written through the value setter', fakeAsync(() => {
    const fixture = createHost();
    tick();
    const component = fixture.componentInstance.postalCode;
    component.postalCode = 'V8V 1X4';
    component.value = '';
    expect(component.postalCode).toBe('V8V 1X4');
  }));

  it('should render the unmasked input with maxlength when displayMask is false', fakeAsync(() => {
    const fixture = createHost();
    fixture.componentInstance.displayMask = false;
    tick();
    fixture.detectChanges();
    expect(input(fixture).getAttribute('maxlength')).toBe('250');
  }));

  it('should report a required error through the control directive', fakeAsync(() => {
    const fixture = createHost();
    tick();
    fixture.componentInstance.setValidator(Validators.required);
    tick();
    fixture.detectChanges();
    expect(
      fixture.componentInstance.postalCode.controlDir.hasError('required')
    ).toBe(true);
  }));

  // The mask itself rejects a malformed separator, so a pattern error cannot
  // reach the model through a masked field. commonValidatePostalcode's pattern
  // branch is covered directly in validate-postalcode.directive.spec.ts.
  it('should normalise a malformed separator into the canonical spaced format', fakeAsync(() => {
    const fixture = createHost();
    tick();
    fixture.componentInstance.setValidator(
      commonValidatePostalcode(true, false)
    );
    control(fixture).setValue('V8V-1X4');
    tick();
    fixture.detectChanges();
    expect(control(fixture).value).toBe('V8V 1X4');
    expect(control(fixture).valid).toBe(true);
  }));

  it('should keep the space in the stored value, as the legacy text mask did', fakeAsync(() => {
    const fixture = createHost();
    tick();
    control(fixture).setValue('V8V 1X4');
    tick();
    fixture.detectChanges();
    expect(fixture.componentInstance.postalCode.postalCode).toBe('V8V 1X4');
  }));

  it('should report invalidBCPostal when bcOnly is set and the code is not BC', fakeAsync(() => {
    const fixture = createHost();
    tick();
    fixture.componentInstance.setValidator(
      commonValidatePostalcode(true, true)
    );
    control(fixture).setValue('K1A 0B1');
    tick();
    fixture.detectChanges();
    expect(
      fixture.componentInstance.postalCode.controlDir.hasError(
        'invalidBCPostal'
      )
    ).toBe(true);
  }));

  it('should accept a BC postal code when bcOnly is set', fakeAsync(() => {
    const fixture = createHost();
    tick();
    fixture.componentInstance.setValidator(
      commonValidatePostalcode(true, true)
    );
    control(fixture).setValue('V8V 1X4');
    tick();
    fixture.detectChanges();
    expect(control(fixture).valid).toBe(true);
  }));

  it('should display the required message once the control is touched and invalid', fakeAsync(() => {
    const fixture = createHost();
    tick();
    fixture.componentInstance.setValidator(Validators.required);
    control(fixture).markAsTouched();
    tick();
    fixture.detectChanges();
    const error = fixture.debugElement.query(
      By.css('common-error-container')
    ).nativeElement;
    expect(error.textContent).toContain('Postal Code is required.');
  }));

  // setErrorMsg runs once, in ngOnInit, so the label is captured at
  // initialisation. Changing [label] afterwards does not rebuild the messages.
  it('should substitute a custom label into the error messages at initialisation', () => {
    const fixture = TestBed.createComponent(PostalCodeComponent);
    fixture.componentInstance.label = 'Mailing postal code';
    fixture.detectChanges();
    expect(fixture.componentInstance._defaultErrMsg['required']).toBe(
      'Mailing postal code is required.'
    );
  });

  it('should set disabled through setDisabledState', fakeAsync(() => {
    const fixture = createHost();
    tick();
    fixture.componentInstance.postalCode.setDisabledState(true);
    expect(fixture.componentInstance.postalCode.disabled).toBe(true);
  }));
});
