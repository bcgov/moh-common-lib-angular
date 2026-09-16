// TODO: code refactor
import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { PhnComponent } from './phn.component';
import { provideNgxMask } from 'ngx-mask';
import {
  Component,
  ViewChild,
  ViewChildren,
  QueryList,
  OnInit,
  Type,
} from '@angular/core';
import {
  createTestingModule,
  tickAndDetectChanges,
  getDebugLabel,
  getDebugElement,
  setInput,
} from '../../../helpers/test-helpers';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  template: '',
})
class PhnTestComponent {
  @ViewChildren(PhnComponent) phnComponent: QueryList<PhnComponent> | undefined;
  phn1!: string;

  defaultLabel = 'Personal Health Number (PHN)';

  constructor() {}
}

@Component({
  template: '',
  imports: [PhnComponent, FormsModule, ReactiveFormsModule],
})
class PhnReactTestComponent extends PhnTestComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group({
      phn1: [this.phn1],
    });
  }
}

@Component({
  template: `
    <form>
      <common-phn name="phn" [(ngModel)]="phnValue"></common-phn>
    </form>
  `,
  imports: [FormsModule, PhnComponent],
})
class PhnNgModelHostComponent {
  @ViewChild(PhnComponent) phnComponent!: PhnComponent;
  phnValue = '';
}

@Component({
  template: `
    <form [formGroup]="form">
      <common-phn formControlName="phn"></common-phn>
    </form>
  `,
  imports: [ReactiveFormsModule, PhnComponent],
})
class PhnReactiveHostComponent {
  @ViewChild(PhnComponent) phnComponent!: PhnComponent;
  form = new FormGroup({ phn: new FormControl('') });
}

describe('Phn.Component', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      providers: [provideNgxMask()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PhnReactTestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should format input correctly with mask', fakeAsync(() => {
    const fixture = TestBed.createComponent(PhnComponent);
    fixture.detectChanges();

    fixture.detectChanges();
    const inputEl = fixture.nativeElement.querySelector('input');

    inputEl.focus();
    inputEl.value = '9999999998';
    inputEl.dispatchEvent(new Event('input'));
    inputEl.dispatchEvent(new Event('change'));
    inputEl.dispatchEvent(new Event('blur'));

    expect(inputEl.value).toBe('9999 999 998');
  }));

  it('should be required', fakeAsync(() => {
    const template = `
        <form>
          <common-phn name='phn1' [(ngModel)]='phn1' [required] = "true"></common-phn>
        </form>`;
    const fixture = createTestingModule(PhnReactTestComponent, template);

    tickAndDetectChanges(fixture);

    const de = getDebugElement(fixture, 'common-phn', 'phn1');

    expect(de).toBeTruthy();
    expect(de.componentInstance.controlDir.hasError('required')).toBeTruthy();
  }));

  it('should display default label', fakeAsync(() => {
    const template = `
         <form [formGroup]="form">
          <common-phn name='phn1' formControlName='phn1'></common-phn>
         </form>`;
    const fixture = createTestingModule(PhnReactTestComponent, template);

    tickAndDetectChanges(fixture);

    const de = getDebugElement(fixture, 'common-phn', 'phn1');
    const label = getDebugLabel(de, de.componentInstance.labelforId);

    expect(de).toBeTruthy();
    expect(label?.trim()).toBe(fixture.componentInstance.defaultLabel);
  }));

  describe('inside a template-driven form', () => {
    let fixture: ComponentFixture<PhnNgModelHostComponent>;
    let host: PhnNgModelHostComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [PhnNgModelHostComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(PhnNgModelHostComponent);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('updates the ngModel-bound host field with the masked value typed into the input', () => {
      setInput(
        fixture.debugElement,
        '9999999998',
        host.phnComponent.labelforId
      );
      fixture.detectChanges();

      expect(host.phnValue).toBe('9999 999 998');
    });

    it('emits blur when the input is blurred', () => {
      const input: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      const blurSpy = jest.fn();
      host.phnComponent.blur.subscribe(blurSpy);

      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(blurSpy).toHaveBeenCalled();
    });
  });

  describe('inside a reactive form', () => {
    let fixture: ComponentFixture<PhnReactiveHostComponent>;
    let host: PhnReactiveHostComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [PhnReactiveHostComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(PhnReactiveHostComponent);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('updates the formControl-bound value with the masked value typed into the input', () => {
      setInput(
        fixture.debugElement,
        '9999999998',
        host.phnComponent.labelforId
      );
      fixture.detectChanges();

      expect(host.form.get('phn')!.value).toBe('9999 999 998');
    });

    it('marks the formControl-bound control touched when the input is blurred', () => {
      const input: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      expect(host.form.get('phn')!.touched).toBe(false);

      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(host.form.get('phn')!.touched).toBe(true);
    });
  });

  // validatePhn() strips leading zeros, underscores and spaces before running
  // the mod 11 checksum. It used to write that stripped string back over
  // this.phn, so simply validating the field rewrote what the user had typed.
  // The checksum verdict must be unchanged by the fix.
  describe('leading-zero entries', () => {
    let fixture: ComponentFixture<PhnReactiveHostComponent>;
    let host: PhnReactiveHostComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [PhnReactiveHostComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(PhnReactiveHostComponent);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    // FormControl.setValue writes through the accessor first and validates
    // second, so this.phn already holds the typed string when validatePhn runs.
    function enter(value: string) {
      const control = host.form.get('phn')!;
      control.setValue(value);
      control.updateValueAndValidity();
      fixture.detectChanges();
      return control;
    }

    it('leaves a valid leading-zero entry exactly as typed', fakeAsync(() => {
      // registerValidation attaches validateSelf through a resolved promise.
      tick();
      const control = enter('09999 999 998');

      // Verdict first, then the stored value: under the 2.1.1 code the verdict
      // is identical and only the stored value regresses.
      expect(control.errors).toBeNull();
      expect(host.phnComponent.phn).toBe('09999 999 998');
    }));

    it('leaves an invalid leading-zero entry exactly as typed', fakeAsync(() => {
      tick();
      // Same digits, wrong check digit: the mod 11 result is 8, not 1.
      const control = enter('09999 999 991');

      expect(control.errors).toEqual({ invalid: true });
      expect(host.phnComponent.phn).toBe('09999 999 991');
    }));

    it('still rejects a leading-zero entry that is too short once stripped', fakeAsync(() => {
      tick();
      const control = enter('0999 999 998');

      expect(control.errors).toEqual({ invalid: true });
      expect(host.phnComponent.phn).toBe('0999 999 998');
    }));
  });
});
