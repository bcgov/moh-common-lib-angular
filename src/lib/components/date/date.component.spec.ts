import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { addDays, startOfToday } from 'date-fns';
import {
  createTestingModule,
  getDebugElement,
  getDebugLegend,
  tickAndDetectChanges,
} from '../../../helpers/test-helpers';
import { DateComponent } from './date.component';
import { MoHCommonLibraryError } from '../../../helpers/library-error';

@Component({
  template: '',
})
class DateTestComponent {
  @ViewChildren(DateComponent)
  dateComponent!: QueryList<DateComponent>;

  date1: Date | null = null;
  rangeStart: Date | null = null;
  rangeEnd: Date | null = null;

  defaultLabel = 'Date';
}

@Component({
  template: '',
  imports: [DateComponent, FormsModule, ReactiveFormsModule],
})
class DateReactTestComponent extends DateTestComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group({
      date1: [this.date1],
    });
  }
}

@Component({
  template: '',
  imports: [DateComponent, FormsModule],
})
class DateNgModelTestComponent extends DateTestComponent {}

const today = startOfToday();
const tomorrow = addDays(today, 1);

/**
 * Fills in whichever of month/day/year are provided, dispatching the same
 * (input)/(blur) events a real user produces (see date.component.html:
 * onBlurMonth/onBlurDay/onBlurYear all fire on (blur), and the day/year
 * inputs additionally carry [commonDateFieldFormat] on (input)). Fields left
 * undefined are not touched, so partial fills are possible.
 */
function fillDate(
  fixture: ComponentFixture<any>,
  de: any,
  parts: { day?: string; month?: string; year?: string }
) {
  if (parts.month !== undefined) {
    const select: HTMLSelectElement = de.query(
      By.css('select.monthSelect')
    ).nativeElement;
    select.value = parts.month;
    select.dispatchEvent(new Event('change'));
    select.dispatchEvent(new Event('blur'));
  }
  if (parts.day !== undefined) {
    const input: HTMLInputElement = de.query(
      By.css('input.dayInput')
    ).nativeElement;
    input.value = parts.day;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
  }
  if (parts.year !== undefined) {
    const input: HTMLInputElement = de.query(
      By.css('input.yearInput')
    ).nativeElement;
    input.value = parts.year;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
  }
  tickAndDetectChanges(fixture);
}

function errorsOf(de: any): Record<string, any> | null {
  return de.componentInstance.controlDir.errors;
}

describe('DateComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
    }).compileComponents();
  });

  it('renders the month select, day input, year input, and the label as a legend', fakeAsync(() => {
    const fixture = createTestingModule(
      DateReactTestComponent,
      `<form [formGroup]="form">
        <common-date name="date1" formControlName="date1" label="Date of birth"></common-date>
      </form>`
    );
    tickAndDetectChanges(fixture);
    const de = getDebugElement(fixture, 'common-date', 'date1');

    expect(de.query(By.css('select.monthSelect'))).toBeTruthy();
    expect(de.query(By.css('input.dayInput'))).toBeTruthy();
    expect(de.query(By.css('input.yearInput'))).toBeTruthy();
    expect(getDebugLegend(de)).toBe('Date of birth');
  }));

  it('marks a required control invalid until a full date is supplied', fakeAsync(() => {
    const fixture = createTestingModule(
      DateNgModelTestComponent,
      `<form>
        <common-date name="date1" label="Date of birth" required [(ngModel)]="date1"></common-date>
      </form>`
    );
    tickAndDetectChanges(fixture);
    const de = getDebugElement(fixture, 'common-date', 'date1');

    expect(errorsOf(de)?.['required']).toBeTruthy();

    fillDate(fixture, de, { day: '5', month: '0', year: '2020' });

    expect(errorsOf(de)?.['required']).toBeFalsy();
  }));

  describe('self-validation errors', () => {
    let fixture: ComponentFixture<DateReactTestComponent>;
    let de: any;

    function build(template: string) {
      fixture = createTestingModule(DateReactTestComponent, template);
      tickAndDetectChanges(fixture);
      de = getDebugElement(fixture, 'common-date', 'date1');
    }

    it('flags dayOutOfRange for a day that does not exist in the given month', fakeAsync(() => {
      build(`<form [formGroup]="form">
        <common-date name="date1" formControlName="date1" label="Date"></common-date>
      </form>`);

      // February (index 1) 2020 is a leap year with 29 days; day 30 is out of range.
      fillDate(fixture, de, { month: '1', day: '30', year: '2020' });

      expect(errorsOf(de)?.['dayOutOfRange']).toBe(true);
    }));

    it('flags yearDistantPast for a date more than 150 years ago with no dateRange bound', fakeAsync(() => {
      build(`<form [formGroup]="form">
        <common-date name="date1" formControlName="date1" label="Date"></common-date>
      </form>`);

      const distantYear = (today.getFullYear() - 200).toString();
      fillDate(fixture, de, { month: '0', day: '1', year: distantYear });

      expect(errorsOf(de)?.['yearDistantPast']).toBe(true);
    }));

    it('flags yearDistantFuture for a date more than 150 years ahead with no dateRange bound', fakeAsync(() => {
      build(`<form [formGroup]="form">
        <common-date name="date1" formControlName="date1" label="Date"></common-date>
      </form>`);

      const distantYear = (today.getFullYear() + 200).toString();
      fillDate(fixture, de, { month: '0', day: '1', year: distantYear });

      expect(errorsOf(de)?.['yearDistantFuture']).toBe(true);
    }));

    it("flags noPastDatesAllowed when restrictDate is 'future' and today's date is entered", fakeAsync(() => {
      build(`<form [formGroup]="form">
        <common-date name="date1" formControlName="date1" label="Date" [restrictDate]="'future'"></common-date>
      </form>`);

      fillDate(fixture, de, {
        month: today.getMonth().toString(),
        day: today.getDate().toString(),
        year: today.getFullYear().toString(),
      });

      expect(errorsOf(de)?.['noPastDatesAllowed']).toBe(true);
    }));

    it("flags noFutureDatesAllowed when restrictDate is 'past' and tomorrow's date is entered", fakeAsync(() => {
      // 'past' is the only restrictDate value msp uses.
      build(`<form [formGroup]="form">
        <common-date name="date1" formControlName="date1" label="Date" [restrictDate]="'past'"></common-date>
      </form>`);

      fillDate(fixture, de, {
        month: tomorrow.getMonth().toString(),
        day: tomorrow.getDate().toString(),
        year: tomorrow.getFullYear().toString(),
      });

      expect(errorsOf(de)?.['noFutureDatesAllowed']).toBe(true);
    }));

    it("allows today's date when restrictDate is 'past'", fakeAsync(() => {
      build(`<form [formGroup]="form">
        <common-date name="date1" formControlName="date1" label="Date" [restrictDate]="'past'"></common-date>
      </form>`);

      fillDate(fixture, de, {
        month: today.getMonth().toString(),
        day: today.getDate().toString(),
        year: today.getFullYear().toString(),
      });

      expect(errorsOf(de)).toBeNull();
    }));

    it('flags invalidRange for a date after dateRangeEnd when only dateRange* inputs are used', fakeAsync(() => {
      fixture = createTestingModule(
        DateReactTestComponent,
        `<form [formGroup]="form">
          <common-date name="date1" formControlName="date1" label="Date"
                       [dateRangeStart]="rangeStart" [dateRangeEnd]="rangeEnd"></common-date>
        </form>`
      );
      fixture.componentInstance.rangeStart = today;
      fixture.componentInstance.rangeEnd = addDays(today, 10);
      tickAndDetectChanges(fixture);
      de = getDebugElement(fixture, 'common-date', 'date1');

      const wayAfterEnd = addDays(today, 20);
      fillDate(fixture, de, {
        month: wayAfterEnd.getMonth().toString(),
        day: wayAfterEnd.getDate().toString(),
        year: wayAfterEnd.getFullYear().toString(),
      });

      expect(errorsOf(de)?.['invalidRange']).toBe(true);
    }));

    it('accepts a date inside a bound dateRangeStart/dateRangeEnd window', fakeAsync(() => {
      fixture = createTestingModule(
        DateReactTestComponent,
        `<form [formGroup]="form">
          <common-date name="date1" formControlName="date1" label="Date"
                       [dateRangeStart]="rangeStart" [dateRangeEnd]="rangeEnd"></common-date>
        </form>`
      );
      fixture.componentInstance.rangeStart = today;
      fixture.componentInstance.rangeEnd = addDays(today, 10);
      tickAndDetectChanges(fixture);
      de = getDebugElement(fixture, 'common-date', 'date1');

      const withinRange = addDays(today, 5);
      fillDate(fixture, de, {
        month: withinRange.getMonth().toString(),
        day: withinRange.getDate().toString(),
        year: withinRange.getFullYear().toString(),
      });

      expect(errorsOf(de)).toBeNull();
    }));

    it('flags invalidValue when the year and day are filled but the month is left blank', fakeAsync(() => {
      build(`<form [formGroup]="form">
        <common-date name="date1" formControlName="date1" label="Date"></common-date>
      </form>`);

      fillDate(fixture, de, { day: '15', year: '2020' });

      expect(errorsOf(de)?.['invalidValue']).toBe(true);
    }));

    it('flags invalidValue when only one of the three fields is filled', fakeAsync(() => {
      build(`<form [formGroup]="form">
        <common-date name="date1" formControlName="date1" label="Date"></common-date>
      </form>`);

      fillDate(fixture, de, { day: '15' });

      expect(errorsOf(de)?.['invalidValue']).toBe(true);
    }));

    it('destroys the internal Date and clears the error once all three fields are cleared', fakeAsync(() => {
      build(`<form [formGroup]="form">
        <common-date name="date1" formControlName="date1" label="Date"></common-date>
      </form>`);

      fillDate(fixture, de, { month: '0', day: '15', year: '2020' });
      expect(de.componentInstance.date).toBeInstanceOf(Date);

      fillDate(fixture, de, { month: 'null', day: '', year: '' });

      expect(de.componentInstance.date).toBeNull();
      expect(errorsOf(de)).toBeNull();
    }));
  });

  describe('MoHCommonLibraryError on conflicting restrictDate / dateRange* inputs', () => {
    // These deliberately avoid createTestingModule(): with its
    // ComponentFixtureAutoDetect provider plus a preceding tick(), the error
    // thrown by ngOnInit does not reach this test's call stack (observed:
    // expect(...).toThrow() reports "did not throw" even though the throw
    // does happen). Creating the fixture directly with TestBed.createComponent
    // and triggering ngOnInit through a single explicit fixture.detectChanges()
    // keeps the throw synchronous and catchable here, matching the pattern
    // already used for XiconButtonComponent's own required-input throw test.
    it('throws when restrictDate is combined with dateRangeStart', () => {
      @Component({
        template: `
          <common-date
            label="Date"
            [restrictDate]="'past'"
            [dateRangeStart]="rangeStart"></common-date>
        `,
        imports: [DateComponent],
      })
      class ConflictHostComponent {
        rangeStart: Date = today;
      }

      TestBed.configureTestingModule({
        imports: [ConflictHostComponent],
      }).compileComponents();

      expect(() => {
        const fixture = TestBed.createComponent(ConflictHostComponent);
        fixture.detectChanges();
      }).toThrow(MoHCommonLibraryError);
    });

    it('throws when restrictDate is combined with dateRangeEnd', () => {
      @Component({
        template: `
          <common-date
            label="Date"
            [restrictDate]="'past'"
            [dateRangeEnd]="rangeEnd"></common-date>
        `,
        imports: [DateComponent],
      })
      class ConflictHostComponent {
        rangeEnd: Date = today;
      }

      TestBed.configureTestingModule({
        imports: [ConflictHostComponent],
      }).compileComponents();

      expect(() => {
        const fixture = TestBed.createComponent(ConflictHostComponent);
        fixture.detectChanges();
      }).toThrow(MoHCommonLibraryError);
    });
  });

  describe('ControlValueAccessor round trip', () => {
    it('writeValue populates the day, month and year display fields', fakeAsync(() => {
      const fixture = createTestingModule(
        DateReactTestComponent,
        `<form [formGroup]="form">
          <common-date name="date1" formControlName="date1" label="Date"></common-date>
        </form>`
      );
      tickAndDetectChanges(fixture);
      const de = getDebugElement(fixture, 'common-date', 'date1');

      fixture.componentInstance.form
        .get('date1')
        ?.setValue(new Date(2019, 5, 21));
      tickAndDetectChanges(fixture);

      const monthSelect: HTMLSelectElement = de.query(
        By.css('select.monthSelect')
      ).nativeElement;
      const dayInput: HTMLInputElement = de.query(
        By.css('input.dayInput')
      ).nativeElement;
      const yearInput: HTMLInputElement = de.query(
        By.css('input.yearInput')
      ).nativeElement;

      expect(monthSelect.value).toBe('5');
      expect(dayInput.value).toBe('21');
      expect(yearInput.value).toBe('2019');
    }));

    it('blurring a field emits dateChange and calls the registered onChange with the new Date', fakeAsync(() => {
      const fixture = createTestingModule(
        DateNgModelTestComponent,
        `<form>
          <common-date name="date1" label="Date" [(ngModel)]="date1"></common-date>
        </form>`
      );
      // Start from a full date already in place (writeValue populates the
      // display fields, proven by the previous test) so this test blurs
      // exactly one field. onBlurDay/onBlurMonth/onBlurYear each call
      // processDate() independently (date.component.ts:315-326), so filling
      // all three fields from blank would emit three times, once per field -
      // that is a fact about the port, not something this test is after.
      fixture.componentInstance.date1 = new Date(2021, 2, 9);
      tickAndDetectChanges(fixture);
      const de = getDebugElement(fixture, 'common-date', 'date1');
      const emitted: (Date | null)[] = [];
      de.componentInstance.dateChange.subscribe((d: Date | null) =>
        emitted.push(d)
      );

      fillDate(fixture, de, { day: '10' });

      expect(emitted.length).toBe(1);
      expect(emitted[0]).toEqual(new Date(2021, 2, 10));
      // [(ngModel)]="date1" round-trips through registerOnChange, so the
      // host's own bound field is proof _onChange was called with this Date.
      expect(fixture.componentInstance.date1).toEqual(new Date(2021, 2, 10));
    }));
  });
});
