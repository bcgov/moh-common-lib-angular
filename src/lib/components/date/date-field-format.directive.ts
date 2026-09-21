import { Directive, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[commonDateFieldFormat]',
})
export class DateFieldFormatDirective {
  @Output() ngModelChange: EventEmitter<string> = new EventEmitter<string>(
    false
  );

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const maxlen = Number.parseInt(input.getAttribute('maxlength') ?? '', 10);

    let trimmed = input.value.trim();
    if (/[^\d]+/.test(input.value)) {
      trimmed = trimmed.replace(/[^\d]/g, '');
    }

    // Only truncate when the host actually carries a usable maxlength. Without
    // the guard an absent attribute reads as 0 and empties the field on every
    // keystroke, which matters because this directive is exported for use on
    // any input, not just the two inside common-date.
    if (Number.isInteger(maxlen) && maxlen > 0) {
      trimmed = trimmed.slice(0, maxlen);
    }

    input.value = trimmed;
    this.ngModelChange.emit(trimmed);
  }
}
