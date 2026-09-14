import { FormControl } from '@angular/forms';
import {
  commonValidatePostalcode,
  ValidatePostalcodeDirective,
} from './validate-postalcode.directive';

function check(value: unknown, hasMask: boolean, bcOnly: boolean) {
  return commonValidatePostalcode(hasMask, bcOnly)(new FormControl(value));
}

describe('commonValidatePostalcode', () => {
  describe('empty values', () => {
    it.each([null, undefined, ''])(
      'should pass %p, leaving required to handle it',
      (value) => {
        expect(check(value, true, false)).toBeNull();
      }
    );
  });

  describe('masked (hasMask = true)', () => {
    it('should accept A1A 1A1 with a space', () => {
      expect(check('V8V 1X4', true, false)).toBeNull();
    });

    it('should accept A1A1A1 without a space', () => {
      expect(check('V8V1X4', true, false)).toBeNull();
    });

    it('should accept lower case', () => {
      expect(check('v8v 1x4', true, false)).toBeNull();
    });

    it.each([
      ['too short', 'V8V 1X'],
      ['too long', 'V8V 1X44'],
      ['digits and letters transposed', '8V8 X1X'],
      ['two spaces', 'V8V  1X4'],
      ['a hyphen instead of a space', 'V8V-1X4'],
      ['a non-alphanumeric character', 'V8V 1X!'],
    ])('should reject %s with a pattern error', (_label, value) => {
      expect(check(value, true, false)).toEqual({ pattern: true });
    });
  });

  describe('unmasked (hasMask = false)', () => {
    it('should accept letters, digits and spaces in any arrangement', () => {
      expect(check('12345', false, false)).toBeNull();
      expect(check('ABCDE', false, false)).toBeNull();
      expect(check('98101 1234', false, false)).toBeNull();
    });

    it.each([
      ['a hyphen', '98101-1234'],
      ['a punctuation mark', 'V8V 1X4.'],
    ])('should reject %s with an invalidChar error', (_label, value) => {
      expect(check(value, false, false)).toEqual({ invalidChar: true });
    });

    it('should reject a value of only spaces, which has no alphanumeric character', () => {
      expect(check('   ', false, false)).toEqual({ invalidChar: true });
    });
  });

  describe('bcOnly', () => {
    it('should accept a V postal code', () => {
      expect(check('V8V 1X4', true, true)).toBeNull();
    });

    // Asymmetry carried over from the legacy library: this check's regex is
    // [Vv] for the leading character but upper case only for the two letter
    // classes, so a fully lower case value fails here while the standalone
    // commonValidateBcPostal accepts it. The component upper cases input
    // before the validator sees it, which is why this never surfaced.
    it('should accept a lower case leading v with upper case letters', () => {
      expect(check('v8V 1X4', true, true)).toBeNull();
    });

    it('should reject a fully lower case value, unlike commonValidateBcPostal', () => {
      expect(check('v8v 1x4', true, true)).toEqual({ invalidBCPostal: true });
    });

    it('should reject a valid Canadian postal code outside BC', () => {
      expect(check('K1A 0B1', true, true)).toEqual({ invalidBCPostal: true });
    });

    it.each([
      ['D', 'V8D 1X4'],
      ['F', 'V8F 1X4'],
      ['I', 'V8I 1X4'],
      ['O', 'V8O 1X4'],
      ['Q', 'V8Q 1X4'],
      ['U', 'V8U 1X4'],
    ])('should reject the excluded letter %s', (_label, value) => {
      expect(check(value, true, true)).toEqual({ invalidBCPostal: true });
    });

    it('should report pattern before invalidBCPostal when both fail', () => {
      expect(check('nonsense', true, true)).toEqual({ pattern: true });
    });

    it('should still apply the BC check when unmasked', () => {
      expect(check('K1A 0B1', false, true)).toEqual({ invalidBCPostal: true });
    });
  });
});

describe('ValidatePostalcodeDirective', () => {
  it('should create an instance', () => {
    expect(new ValidatePostalcodeDirective()).toBeTruthy();
  });

  it('should default hasMask to true and bcOnly to false', () => {
    const directive = new ValidatePostalcodeDirective();
    expect(directive.hasMask).toBe(true);
    expect(directive.bcOnly).toBe(false);
  });

  it('should validate against the masked format by default', () => {
    const directive = new ValidatePostalcodeDirective();
    expect(directive.validate(new FormControl('V8V 1X4'))).toBeNull();
    expect(directive.validate(new FormControl('V8V-1X4'))).toEqual({
      pattern: true,
    });
  });

  it('should apply the BC rule once bcOnly is set', () => {
    const directive = new ValidatePostalcodeDirective();
    directive.bcOnly = true;
    expect(directive.validate(new FormControl('K1A 0B1'))).toEqual({
      invalidBCPostal: true,
    });
  });

  it('should switch to the unmasked rule once hasMask is cleared', () => {
    const directive = new ValidatePostalcodeDirective();
    directive.hasMask = false;
    expect(directive.validate(new FormControl('98101'))).toBeNull();
  });
});
