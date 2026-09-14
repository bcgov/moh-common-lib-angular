import { FormControl } from '@angular/forms';
import {
  commonValidateRegion,
  ValidateRegionDirective,
} from './validate-region.directive';

function check(value: unknown) {
  return commonValidateRegion(new FormControl(value));
}

describe('commonValidateRegion', () => {
  it.each([null, undefined, ''])(
    'should pass %p, leaving required to handle it',
    (value) => {
      expect(check(value)).toBeNull();
    }
  );

  it.each([
    ['a plain name', 'British Columbia'],
    ['a hyphenated name', 'Newfoundland-Labrador'],
    ['an apostrophe', "Coeur d'Alene"],
    ['a period', 'St. John'],
  ])('should accept %s', (_label, value) => {
    expect(check(value)).toBeNull();
  });

  it('should reject a value with no letter at all', () => {
    expect(check('123')).toEqual({ invalidChar: true });
  });

  it('should reject digits mixed with letters, unlike commonValidateCity', () => {
    expect(check('Region 5')).toEqual({ invalidChar: true });
  });

  it.each([
    ['a comma', 'Vancouver, BC'],
    ['an ampersand', 'A & B'],
    ['a slash', 'A/B'],
  ])('should reject %s', (_label, value) => {
    expect(check(value)).toEqual({ invalidChar: true });
  });
});

describe('ValidateRegionDirective', () => {
  it('should create an instance', () => {
    expect(new ValidateRegionDirective()).toBeTruthy();
  });

  it('should return null for a valid region name', () => {
    expect(
      new ValidateRegionDirective().validate(
        new FormControl('British Columbia')
      )
    ).toBeNull();
  });

  it('should return invalidChar for a region name with a digit', () => {
    expect(
      new ValidateRegionDirective().validate(new FormControl('Region 5'))
    ).toEqual({
      invalidChar: true,
    });
  });
});
