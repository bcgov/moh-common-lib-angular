import { Directive, Input } from '@angular/core';
import {
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
  NG_VALIDATORS,
  Validator,
} from '@angular/forms';

/**
 * Shared implementation. The exported validator function and the directive must
 * agree, so both go through here.
 */
function validatePC(
  control: AbstractControl,
  hasMask: boolean,
  bcOnly: boolean
): ValidationErrors | null {
  if (control.value) {
    if (hasMask) {
      const cdnFormat: RegExp = /^[A-Za-z][0-9][A-Za-z]\s?[0-9][A-Za-z][0-9]$/;

      if (!cdnFormat.test(control.value)) {
        return { pattern: true };
      }
    } else {
      const criteria: RegExp = RegExp('^(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ]*$');

      if (!criteria.test(control.value)) {
        return { invalidChar: true };
      }
    }

    if (bcOnly) {
      // Valid characters for BC postal code
      const bcFormat: RegExp = RegExp(
        '^[Vv]\\d[ABCEGHJ-NPRSTV-Z][ ]?\\d[ABCEGHJ-NPRSTV-Z]\\d$'
      );
      if (!bcFormat.test(control.value)) {
        return { invalidBCPostal: true };
      }
    }
  }
  return null;
}

export function commonValidatePostalcode(
  hasMask: boolean,
  bcOnly: boolean
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return validatePC(control, hasMask, bcOnly);
  };
}

@Directive({
  selector: '[commonValidatePostalcode]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: ValidatePostalcodeDirective,
      multi: true,
    },
  ],
})
export class ValidatePostalcodeDirective implements Validator {
  @Input() hasMask: boolean = true;
  @Input() bcOnly: boolean = false;

  validate(control: AbstractControl): { [key: string]: any } | null {
    return validatePC(control, this.hasMask, this.bcOnly);
  }
}
