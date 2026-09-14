import {
  Component,
  Input,
  Optional,
  Self,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { FormsModule, NgControl, ValidationErrors } from '@angular/forms';
import { AbstractFormControl } from '../../models/abstract-form-control';
import {
  ErrorMessage,
  LabelReplacementTag,
  RequiredMsg,
} from '../../models/error-message.interface';
import { CommonModule } from '@angular/common';
import { ErrorContainerComponent } from '../error-container/error-container.component';

interface ErrorMessageExtended extends ErrorMessage {
  invalidEmail: string;
  invalidChars: string;
  [key: string]: string;
}

/**
 * A properly formatted address: a local part, a single @, and a dotted domain.
 * The local part excludes @ and every domain label excludes the dot, so no two
 * quantifiers can match the same character and the expression cannot backtrack
 * over the input.
 */
const formatCriteria = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

/**
 * Printable ASCII characters only.
 */
const asciiPrintable = /^[ -~]+$/;

/**
 * An email address field.
 *
 * Required validation comes from Angular's own RequiredValidator, which matches
 * the `required` attribute on the host element. It works in both template driven
 * and reactive forms, so ngModel is not needed for it. The `required` input below
 * only forwards the native attribute to the inner input, and only when it is bound
 * as a property: `[required]="true"` sets the attribute, while a bare `required`
 * attribute passes an empty string and leaves the inner input without it.
 *
 * @example
 *   <common-email name="email" [(ngModel)]="person.email" [required]="true">
 *   </common-email>
 *
 *   Bind [required], do not write a bare required attribute: the bare form
 *   passes an empty string and the inner input never receives it.
 */
@Component({
  selector: 'common-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss'],
  imports: [CommonModule, FormsModule, ErrorContainerComponent],
})
export class EmailComponent extends AbstractFormControl implements OnInit {
  @Input() label: string = 'Email';
  @Input() maxlength: string = '255';
  @Input() labelforId: string = 'email_' + this.objectId;
  @Input() required: boolean = false;

  @Input()
  set value(val: string) {
    if (val) {
      this.email = val;
    }
  }
  get value() {
    return this.email;
  }

  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() blur: EventEmitter<any> = new EventEmitter<any>();

  email: string = '';

  override _defaultErrMsg: ErrorMessageExtended = {
    required: RequiredMsg,
    invalidEmail: `${LabelReplacementTag} must be properly formatted (e.g. name@domain.com)`,
    invalidChars: `${LabelReplacementTag} must contain letters, numbers and/or symbols(e.g. #, @, !).`,
  };

  constructor(@Optional() @Self() public controlDir: NgControl) {
    super();
    if (controlDir) {
      controlDir.valueAccessor = this;
    }
  }

  override ngOnInit() {
    super.ngOnInit();

    this.registerValidation(this.controlDir, this.validateSelf);
  }

  onValueChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.email = value;
    this._onChange(value);
    this.valueChange.emit(value);
  }

  onBlur(event: any) {
    this._onTouched(event);
    this.blur.emit(event.target.value);
  }

  writeValue(value: any): void {
    if (value) {
      this.email = value;
    }
  }

  private validateSelf(): ValidationErrors | null {
    if (this.email) {
      let result = formatCriteria.test(this.email);
      if (result) {
        result = asciiPrintable.test(this.email);
        return result ? null : { invalidChars: true };
      }
      return { invalidEmail: true };
    }
    return null;
  }
}
