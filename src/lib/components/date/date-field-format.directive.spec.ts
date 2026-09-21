import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateFieldFormatDirective } from './date-field-format.directive';

@Component({
  template: `
    <input
      commonDateFieldFormat
      maxlength="2"
      (ngModelChange)="onChange($event)" />
  `,
  imports: [DateFieldFormatDirective],
})
class HostComponent {
  emitted: string[] = [];

  onChange(value: string) {
    this.emitted.push(value);
  }
}

// The directive is exported on its own, so it can be applied to any input,
// not just the two inside common-date that carry a maxlength.
@Component({
  template: `
    <input commonDateFieldFormat (ngModelChange)="onChange($event)" />
  `,
  imports: [DateFieldFormatDirective],
})
class NoMaxlengthHostComponent {
  emitted: string[] = [];

  onChange(value: string) {
    this.emitted.push(value);
  }
}

describe('DateFieldFormatDirective without a maxlength on the host', () => {
  let fixture: ComponentFixture<NoMaxlengthHostComponent>;
  let input: HTMLInputElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoMaxlengthHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NoMaxlengthHostComponent);
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input');
  });

  it('keeps the typed digits instead of clearing the field', () => {
    input.value = '12345';
    input.dispatchEvent(new Event('input'));

    expect(input.value).toBe('12345');
    expect(fixture.componentInstance.emitted).toEqual(['12345']);
  });

  it('still strips non-digit characters', () => {
    input.value = '1a2b3';
    input.dispatchEvent(new Event('input'));

    expect(input.value).toBe('123');
    expect(fixture.componentInstance.emitted).toEqual(['123']);
  });
});

describe('DateFieldFormatDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let input: HTMLInputElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input');
  });

  function typeIntoField(value: string) {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  it('strips non-digit characters typed into the field', () => {
    typeIntoField('a1b2c');

    expect(input.value).toBe('12');
  });

  it("truncates to the host's maxlength attribute", () => {
    typeIntoField('12345');

    expect(input.value).toBe('12');
  });

  it('applies both the digit strip and the maxlength truncation together, in that order', () => {
    // Non-digits stripped first ("9x9y9" -> "999"), then truncated to the
    // maxlength=2 on the host, so the result is "99" and not "9x" or "9y".
    typeIntoField('9x9y9');

    expect(input.value).toBe('99');
  });

  it('emits the cleaned value through ngModelChange', () => {
    typeIntoField('9x9y9');

    expect(fixture.componentInstance.emitted).toEqual(['99']);
  });

  it('leaves a value already within the digit limit unchanged', () => {
    typeIntoField('7');

    expect(input.value).toBe('7');
    expect(fixture.componentInstance.emitted).toEqual(['7']);
  });
});
