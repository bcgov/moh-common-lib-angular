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
