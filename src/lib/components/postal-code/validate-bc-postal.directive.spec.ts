import { FormControl } from '@angular/forms';
import {
  commonValidateBcPostal,
  ValidateBcPostalDirective,
} from './validate-bc-postal.directive';

function check(value: unknown) {
  return commonValidateBcPostal(new FormControl(value));
}

describe('commonValidateBcPostal', () => {
  it.each([null, undefined, ''])(
    'should pass %p, leaving required to handle it',
    (value) => {
      expect(check(value)).toBeNull();
    }
  );

  it('should accept a BC postal code with a space', () => {
    expect(check('V8V 1X4')).toBeNull();
  });

  it('should accept a BC postal code without a space', () => {
    expect(check('V8V1X4')).toBeNull();
  });

  it('should accept lower case, unlike the bcOnly check in commonValidatePostalcode', () => {
    expect(check('v8v 1x4')).toBeNull();
  });

  it('should reject a Canadian postal code outside BC', () => {
    expect(check('K1A 0B1')).toEqual({ invalidBCPostal: true });
  });

  it.each([
    ['D', 'V8D 1X4'],
    ['F', 'V8F 1X4'],
    ['I', 'V8I 1X4'],
    ['O', 'V8O 1X4'],
    ['Q', 'V8Q 1X4'],
    ['U', 'V8U 1X4'],
  ])('should reject the excluded letter %s', (_label, value) => {
    expect(check(value)).toEqual({ invalidBCPostal: true });
  });

  it('should reject a malformed value', () => {
    expect(check('nonsense')).toEqual({ invalidBCPostal: true });
  });
});

describe('ValidateBcPostalDirective', () => {
  it('should create an instance', () => {
    expect(new ValidateBcPostalDirective()).toBeTruthy();
  });

  it('should return null for a BC postal code', () => {
    expect(
      new ValidateBcPostalDirective().validate(new FormControl('V8V 1X4'))
    ).toBeNull();
  });

  it('should return invalidBCPostal for a postal code outside BC', () => {
    expect(
      new ValidateBcPostalDirective().validate(new FormControl('K1A 0B1'))
    ).toEqual({
      invalidBCPostal: true,
    });
  });
});
