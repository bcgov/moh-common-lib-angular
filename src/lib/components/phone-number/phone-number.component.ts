// TODO: code refactor / validation
import {
  Component,
  Input,
  Output,
  EventEmitter,
  Optional,
  Self,
  OnInit,
  ElementRef,
} from '@angular/core';
import { AbstractControl, FormsModule, NgControl } from '@angular/forms';
import {
  ErrorMessage,
  LabelReplacementTag,
  RequiredMsg,
} from '../../models/error-message.interface';
import { AbstractFormControl } from '../../models/abstract-form-control';
import { initialConfig, NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { CommonModule } from '@angular/common';
import { ErrorContainerComponent } from '../error-container/error-container.component';

interface ErrorMessageExtended extends ErrorMessage {
  incompleteValue: string;
  [key: string]: string;
}

/**
 * A phone number field, masked to the North American format.
 *
 * @example
 *         <common-phone-number name='phoneNumber'
 *                              [(ngModel)]='dataService.facAdminPhoneNumber'
 *                              required></common-phone-number>
 */
@Component({
  selector: 'common-phone-number',
  templateUrl: './phone-number.component.html',
  styleUrls: ['./phone-number.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ErrorContainerComponent,
    NgxMaskDirective,
  ],
  providers: [provideNgxMask()],
})
export class PhoneNumberComponent
  extends AbstractFormControl
  implements OnInit
{
  static PhoneNumberRegEx = '^[2-9]{1}\\d{2}[\\-]?\\d{3}[\\-]?\\d{4}$';

  // ngx-mask replaces its whole pattern table when [patterns] is bound, so the
  // stock tokens are kept and 'N' (a digit 2-9) is added for the default mask.
  // A custom [mask] that does not use 'N' behaves exactly as before.
  readonly patterns = {
    ...initialConfig.patterns,
    N: { pattern: /[2-9]/ },
  };

  @Input() displayMask: boolean = true;
  @Input() required: boolean = false;
  @Input() label: string = 'Mobile';

  @Input() allowInternational: boolean = true;
  @Input() mask = '(N00) 000-0000';

  // TODO: Remove once all project using library remove placeholders -- Temporary solution
  @Input() enablePlaceHolder: boolean = true;

  // Setter/getter for when not used in form (ex. data dislayed but not edittable)
  @Input()
  set value(val: string) {
    if (val !== undefined) {
      this.phoneNumber = val;
    }
  }
  get value() {
    return this.phoneNumber;
  }

  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

  public phoneNumber: string = '';

  //public mask: any;
  public placeholder!: string;

  // Abstact variable defined
  override _defaultErrMsg: ErrorMessageExtended = {
    required: RequiredMsg,
    incompleteValue: `${LabelReplacementTag} does not appear to be valid.`,
  };

  constructor(
    @Optional() @Self() public controlDir: NgControl,
    private inputElement: ElementRef
  ) {
    super();
    if (controlDir) {
      controlDir.valueAccessor = this;
    }
  }

  override ngOnInit() {
    super.ngOnInit();

    const internationalPrefix = '+1 ';
    this.placeholder = this.enablePlaceHolder ? '(555) 555-5555' : '';

    if (this.allowInternational) {
      if (this.placeholder) {
        this.placeholder = `${internationalPrefix} ${this.placeholder}`;
      }
    }

    this.registerValidation(this.controlDir, this.validateSelf);
  }

  setPhoneNumber(data: any) {
    this.phoneNumber = data?.target
      ? (data.target as HTMLInputElement).value
      : data;
    this.valueChange.emit(this.phoneNumber);
    this._onChange(this.phoneNumber);
  }

  onBlur($event: any) {
    this._onTouched($event);
  }

  writeValue(value: any): void {
    if (value !== undefined) {
      // phoneNumber is where the actual data is displayed to user for this
      // component
      this.phoneNumber = value;
    }
  }

  // Reads the control value, not phoneNumber: writeValue() skips undefined,
  // so phoneNumber can be stale after control.setValue(undefined).
  private validateSelf(control: AbstractControl) {
    const value = control.value;
    // In masked mode the control holds 10 digits, with no '+1 ' prefix:
    // ngx-mask 19.0.7 defaults dropSpecialCharacters to true
    // (fesm2022/ngx-mask.mjs:63) and formControlResult() removes the prefix
    // before emitting (fesm2022/ngx-mask.mjs:1392-1394). So a complete number
    // is 10 digits whether or not allowInternational is set. The same count
    // applies to unmasked input.
    const phoneLength = 10;

    if (value === null || value === undefined || value === '') {
      return null;
    }
    // String() because ngx-mask can emit a number for a numeric model.
    const digits = String(value).replace(/\D/g, '');
    // The mask only guards typing; a programmatic value or a custom mask can
    // still reach here, so enforce 10 digits starting 2-9 as well.
    return digits.length === phoneLength &&
      new RegExp(PhoneNumberComponent.PhoneNumberRegEx).test(digits)
      ? null
      : { incompleteValue: true };
  }
}
