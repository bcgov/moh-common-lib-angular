import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CityComponent } from '../components/city/city.component';
import { EmailComponent } from '../components/email/email.component';
import { NameComponent } from '../components/name/name.component';
import { PhnComponent } from '../components/phn/phn.component';
import { PhoneNumberComponent } from '../components/phone-number/phone-number.component';
import { PostalCodeComponent } from '../components/postal-code/postal-code.component';
import { ProvinceComponent } from '../components/province/province.component';
import { SinComponent } from '../components/sin/sin.component';
import { StreetComponent } from '../components/street/street.component';

/**
 * ControlValueAccessor's onChange callback takes the control's VALUE. Several of
 * these components used to pass a boolean, which put `true` into the bound form
 * control instead of what the user typed. The legacy library passed the value,
 * so this pins the whole family against that regression returning.
 */
const CASES: Array<{
  name: string;
  type: any;
  typed: string;
  /** Drives the component's own change handler the way its template does. */
  change: (component: any, value: string) => void;
  /** What the control should end up holding, if not the typed string. */
  expected?: string;
}> = [
  {
    name: 'CityComponent',
    type: CityComponent,
    typed: 'Victoria',
    change: (c, v) => c.onValueChange(v),
  },
  {
    name: 'EmailComponent',
    type: EmailComponent,
    typed: 'someone@example.test',
    change: (c, v) => c.onValueChange({ target: { value: v } } as any),
  },
  {
    name: 'NameComponent',
    type: NameComponent,
    typed: 'Alejandra',
    change: (c, v) => c.onValueChange({ target: { value: v } } as any),
  },
  {
    name: 'PhnComponent',
    type: PhnComponent,
    typed: '9999999998',
    change: (c, v) => c.onValueChange({ target: { value: v } } as any),
  },
  {
    name: 'PhoneNumberComponent',
    type: PhoneNumberComponent,
    typed: '2501234567',
    change: (c, v) => c.setPhoneNumber({ target: { value: v } } as any),
  },
  {
    name: 'PostalCodeComponent',
    type: PostalCodeComponent,
    typed: 'v8v 1x4',
    expected: 'V8V 1X4', // it upper cases before reporting
    change: (c, v) => c.onValueChange(v),
  },
  {
    name: 'ProvinceComponent',
    type: ProvinceComponent,
    typed: 'BC',
    change: (c, v) => c.onValueChange({ target: { value: v } } as any),
  },
  {
    name: 'SinComponent',
    type: SinComponent,
    typed: '046454286',
    // Takes the raw value, like StreetComponent and unlike the Event-based ones.
    change: (c, v) => c.onValueChange(v),
  },
  {
    name: 'StreetComponent',
    type: StreetComponent,
    typed: '1234 Main St',
    // Unlike its siblings, this handler takes the raw value, not an Event.
    change: (c, v) => c.onValueChange(v),
  },
];

describe('ControlValueAccessor value contract', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  CASES.forEach(({ name, type, typed, change, expected }) => {
    it(`${name} should report the value, not a boolean`, () => {
      const fixture = TestBed.createComponent(type);
      const component: any = fixture.componentInstance;
      fixture.detectChanges();

      const reported: unknown[] = [];
      component.registerOnChange((v: unknown) => reported.push(v));

      change(component, typed);

      expect(reported.length).toBe(1);
      expect(typeof reported[0]).toBe('string');
      expect(reported[0]).toBe(expected ?? typed);
    });
  });
});
