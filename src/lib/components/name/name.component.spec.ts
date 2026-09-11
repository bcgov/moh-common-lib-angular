import { TestBed } from '@angular/core/testing';
import { NameComponent } from './name.component';
import { FormsModule } from '@angular/forms';
import { ValidationErrors } from '@angular/forms';

describe('Name.Component', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NameComponent, FormsModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(NameComponent);
    const cmpInstance = fixture.componentInstance;
    expect(cmpInstance).toBeTruthy();
  });

  /**
   * validateSelf is private and is registered as a bound validator by
   * AbstractFormControl.registerValidation. Calling it through index access keeps
   * the component as `this`, which is how the form sees it at runtime.
   */
  const validate = (
    maxlength: string,
    name: string
  ): ValidationErrors | null => {
    const component = TestBed.createComponent(NameComponent).componentInstance;
    component.maxlength = maxlength;
    component.value = name;
    return component['validateSelf']();
  };

  describe('validation of a name (maxlength greater than 1)', () => {
    it('should accept a name of letters, hyphens, periods, apostrophes and blanks', () => {
      expect(validate('255', "Anne-Marie O'Brien Jr.")).toBeNull();
    });

    it('should reject a name that does not begin with a letter', () => {
      expect(validate('255', '1Anne')).toEqual({ invalid: true });
    });

    it('should reject a name containing a special character', () => {
      expect(validate('255', 'Anne@Marie')).toEqual({ invalid: true });
    });

    it('should accept an empty name, since required is validated separately', () => {
      expect(validate('255', '')).toBeNull();
    });
  });

  describe('validation of initials (maxlength of 1)', () => {
    it('should accept a single letter', () => {
      expect(validate('1', 'A')).toBeNull();
    });

    it('should reject a digit', () => {
      expect(validate('1', '7')).toEqual({ invalidChar: true });
    });

    it('should reject a special character', () => {
      expect(validate('1', '@')).toEqual({ invalidChar: true });
    });

    it('should reject more than one letter', () => {
      expect(validate('1', 'AB')).toEqual({ invalidChar: true });
    });
  });
});
