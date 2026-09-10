// TODO: Code refactor
import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  fakeAsync,
  TestBed,
} from '@angular/core/testing';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { EmailComponent } from './email.component';

import {
  Component,
  ViewChildren,
  QueryList,
  OnInit,
  Type,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  tickAndDetectChanges,
  getDebugLabel,
  setInput,
  getDebugElement,
} from '../../../helpers/test-helpers';
import { BrowserModule } from '@angular/platform-browser';

export function createTestingModule<T>(
  cmp: Type<T>,
  template: string
): ComponentFixture<EmailReactTestComponent> {
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
  ) as ComponentFixture<EmailReactTestComponent>;
}

@Component({
  template: '',
  imports: [EmailComponent, FormsModule],
})
class EmailTemplateTestComponent {
  email1: string = '';
}

@Component({
  template: '',
})
class EmailTestComponent {
  @ViewChildren(EmailComponent) emailComponent!: QueryList<EmailComponent>;

  email1!: string;
  email2!: string;

  defaultLabel: string = 'Email';
}

@Component({
  template: '',
  imports: [EmailComponent, FormsModule, ReactiveFormsModule],
})
class EmailReactTestComponent extends EmailTestComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group({
      email1: [this.email1],
      email2: [this.email2, Validators.required],
    });
  }
}

describe('Email.Component', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
    }).compileComponents();
  });

  it('should create', fakeAsync(() => {
    const fixture = createTestingModule(
      EmailReactTestComponent,
      `<form [formGroup]="form">
          <common-email name='email1' formControlName='email1'></common-email>
         </form>`
    );

    const component = fixture.componentInstance;
    const de = getDebugElement(fixture, 'common-email', 'email1');
    tickAndDetectChanges(fixture);

    expect(de).toBeTruthy();
    expect(getDebugLabel(de, de.componentInstance.labelforId)).toBe(
      component.defaultLabel
    );
    expect(de.componentInstance.controlDir.hasError('required')).toBeFalsy();
  }));

  it('should be required', fakeAsync(() => {
    const fixture = createTestingModule(
      EmailReactTestComponent,
      `<form [formGroup]="form">
          <common-email name='email2' formControlName='email2'></common-email>
         </form>`
    );

    const de = getDebugElement(fixture, 'common-email', 'email2');
    tickAndDetectChanges(fixture);
    expect(de).toBeTruthy();
    expect(de.componentInstance.controlDir.hasError('required')).toBeTruthy();
  }));

  it('should be invalid when format is incorrect', fakeAsync(() => {
    const fixture = createTestingModule(
      EmailReactTestComponent,
      `<form [formGroup]="form">
          <common-email name='email1' formControlName='email1'></common-email>
         </form>`
    );

    const de = getDebugElement(fixture, 'common-email', 'email1');

    setInput(de, '234is@jest');
    tickAndDetectChanges(fixture);
    fixture.whenStable().then(() => {
      expect(de).toBeTruthy();
      expect(
        de.componentInstance.controlDir.hasError('invalidEmail')
      ).toBeTruthy();
    });
  }));

  it('should be valid when format is correct', fakeAsync(() => {
    const fixture = createTestingModule(
      EmailReactTestComponent,
      `<form [formGroup]="form">
          <common-email name='email1' formControlName='email1'></common-email>
         </form>`
    );

    const de = getDebugElement(fixture, 'common-email', 'email1');

    setInput(de, 'test@test.com');

    tickAndDetectChanges(fixture);
    expect(de).toBeTruthy();
    expect(
      de.componentInstance.controlDir.hasError('invalidEmail')
    ).toBeFalsy();
  }));

  it('should be invalid where non-printable ascii characters are present', fakeAsync(() => {
    const fixture = createTestingModule(
      EmailReactTestComponent,
      `<form [formGroup]="form">
          <common-email name='email1' formControlName='email1'></common-email>
         </form>`
    );

    const de = getDebugElement(fixture, 'common-email', 'email1');

    setInput(de, 'testlklsdäô@ksdlkd.com');
    tickAndDetectChanges(fixture);
    fixture.whenStable().then(() => {
      expect(
        de.componentInstance.controlDir.hasError('invalidChars')
      ).toBeTruthy();
    });
  }));

  /**
   * validateSelf is private and is registered as a bound validator by
   * AbstractFormControl.registerValidation. Calling it through index access keeps
   * the component as `this`, which is how the form sees it at runtime.
   */
  const validate = (email: string): ValidationErrors | null => {
    const component = TestBed.createComponent(EmailComponent).componentInstance;
    component.value = email;
    return component['validateSelf']();
  };

  describe('validation of the address format', () => {
    it('should accept an address with a multi part domain', () => {
      expect(validate('first.last@mail.gov.bc.ca')).toBeNull();
    });

    it('should reject an address holding more than one @', () => {
      expect(validate('name@domain@example.com')).toEqual({
        invalidEmail: true,
      });
    });

    it('should reject consecutive dots in the domain', () => {
      expect(validate('name@domain..com')).toEqual({ invalidEmail: true });
    });

    it('should reject a domain with no dot', () => {
      expect(validate('234is@jest')).toEqual({ invalidEmail: true });
    });

    it('should reject a trailing dot', () => {
      expect(validate('name@domain.com.')).toEqual({ invalidEmail: true });
    });

    it('should flag non-printable characters in an otherwise valid address', () => {
      expect(validate('tästlklsd@ksdlkd.com')).toEqual({
        invalidChars: true,
      });
    });

    it('should accept an empty value, since required is validated separately', () => {
      expect(validate('')).toBeNull();
    });
  });

  describe('required validation on the host element', () => {
    it('should apply in a reactive form without ngModel', fakeAsync(() => {
      const fixture = createTestingModule(
        EmailReactTestComponent,
        `<form [formGroup]="form">
            <common-email name='email1' formControlName='email1' required></common-email>
           </form>`
      );

      tickAndDetectChanges(fixture);
      const control = fixture.componentInstance.form.get(
        'email1'
      ) as FormControl;
      expect(control.hasError('required')).toBeTruthy();
    }));

    it('should apply in a template driven form', fakeAsync(() => {
      const fixture = createTestingModule(
        EmailTemplateTestComponent as unknown as Type<EmailReactTestComponent>,
        `<form>
            <common-email name='email1' [(ngModel)]='email1' required></common-email>
           </form>`
      );

      tickAndDetectChanges(fixture);
      const de = getDebugElement(fixture, 'common-email', 'email1');
      expect(de.componentInstance.controlDir.hasError('required')).toBeTruthy();
    }));
  });
});
