import {
  Component,
  EventEmitter,
  Input,
  Output,
  Optional,
  Self,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NgControl, FormsModule } from '@angular/forms';
import {
  ErrorMessage,
  LabelReplacementTag,
  RequiredMsg,
} from '../../models/error-message.interface';
import { AbstractFormControl } from '../../models/abstract-form-control';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

interface ErrorMessageExtended extends ErrorMessage {
  invalidChar: string;
  pattern: string;
  invalidBCPostal: string;
  [key: string]: string;
}

/**
 * A Canadian postal code field, masked to the A1A 1A1 format by default.
 *
 * Validation is not built in. Attach commonValidatePostalcode, or the
 * commonValidatePostalcode directive, to get pattern and BC-only checking.
 *
 * @example
 * <common-postal-code name="pc" [(ngModel)]="postalCode"
 *                     commonValidatePostalcode [bcOnly]="true">
 * </common-postal-code>
 *
 * @export
 */
@Component({
  selector: 'common-postal-code',
  templateUrl: './postal-code.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ErrorContainerComponent,
    NgxMaskDirective,
  ],
  providers: [provideNgxMask()],
})
export class PostalCodeComponent
  extends AbstractFormControl
  implements OnInit, ControlValueAccessor
{
  @Input() label = 'Postal Code';
  @Input() displayMask = true;
  @Input() maxlen = '250';
  @Input() labelforId = 'postalCode_' + this.objectId;
  @Input() required = false;
  @Input() mask = 'S0S 0S0';

  override _defaultErrMsg: ErrorMessageExtended = {
    required: RequiredMsg,
    invalidChar: `${LabelReplacementTag} must contain letters and/or numbers and may include blank characters.`,
    pattern: 'Must be in the format A1A 1A1',
    invalidBCPostal: 'Invalid postal code for British Columbia.',
  };

  @Input()
  set value(val: string) {
    if (val) {
      this.postalCode = val;
    }
  }
  get value() {
    return this.postalCode;
  }

  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() blurEvent: EventEmitter<any> = new EventEmitter<any>();

  postalCode = '';

  constructor(@Optional() @Self() public controlDir: NgControl) {
    super();
    if (controlDir) {
      controlDir.valueAccessor = this;
    }
  }

  onValueChange(value: string) {
    // Postal codes are always stored upper case. The legacy component did this
    // through the text mask's pipe, which ngx-mask has no equivalent of.
    const upperCased = this.upperCasePipe(value ?? '');

    if (upperCased !== this.postalCode) {
      // IE fix when focus does not display required error
      this.postalCode = upperCased;
      this._onChange(upperCased);
      this.valueChange.emit(upperCased);
    }
  }

  onBlurEvent(event: any) {
    this._onTouched(event);
    this.blurEvent.emit(event);
  }

  writeValue(value: any): void {
    if (value !== undefined) {
      this.postalCode = value;
    }
  }

  /**
   * Upper cases letters in string
   */
  upperCasePipe(text: string) {
    return text.toUpperCase();
  }
}
