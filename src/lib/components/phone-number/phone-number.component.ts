// TODO: code refactor / validation
import {
  Component,
  Input,
  Output,
  EventEmitter,
  Optional,
  Self,
  OnInit,
  ElementRef
} from '@angular/core';
import { FormsModule, NgControl } from '@angular/forms';
import { ErrorMessage, LabelReplacementTag } from '../../models/error-message.interface';
import { AbstractFormControl } from '../../models/abstract-form-control';
import { NgxMaskDirective } from 'ngx-mask';
import { CommonModule } from '@angular/common';
import { ErrorContainerComponent } from '../error-container/error-container.component';

interface ErrorMessageExtended extends ErrorMessage {
  incompleteValue: string
  [key: string]: string;
}

/**
 * PhoneNumberComponent is a used to show the Phone number.
 *
 *
 * @example
 *         <common-phone-number name='phoneNumber'
 *                              [(ngModel)]='dataService.facAdminPhoneNumber'
 *                              required></common-phone-number>
 * @export
 */
@Component({
  selector: 'common-phone-number',
  templateUrl: './phone-number.component.html',
  styleUrls: ['./phone-number.component.scss'],
  imports: [  
    CommonModule, 
    FormsModule,
    ErrorContainerComponent,
    NgxMaskDirective,],
})

export class PhoneNumberComponent extends AbstractFormControl implements OnInit {

  static PhoneNumberRegEx = '^[2-9]{1}\\d{2}[\\-]?\\d{3}[\\-]?\\d{4}$';
  @Input() displayMask: boolean = true;
  @Input() required: boolean = false;
  @Input() label: string = 'Mobile';

  @Input() allowInternational: boolean = true;
  @Input() mask = '(000) 000-0000';

  // TODO: Remove once all project using library remove placeholders -- Temporary solution
  @Input() enablePlaceHolder: boolean = true;

  // Setter/getter for when not used in form (ex. data dislayed but not edittable)
  @Input()
  set value( val: string ) {
    if ( val !== undefined ) {
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
    required: `${LabelReplacementTag} is required.`,
    incompleteValue: `${LabelReplacementTag} does not appear to be valid.`
  };

  constructor(@Optional() @Self() public controlDir: NgControl, private inputElement: ElementRef) {
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
      if ( this.placeholder ) {
        this.placeholder = `${internationalPrefix} ${this.placeholder}`;
      }

    }
    
    // Register self validation
    // Promise.resolve().then(() => {

    //   if (this.controlDir) {

    //     const allValidators = [this.validateSelf.bind(this)];
    //     if (this.controlDir.control && this.controlDir.control.validator) {
    //        //const existingValidator = this.controlDir.control.validator;

    //       allValidators.push(this.controlDir.control.validator());
    //     }
    //     if (this.controlDir.control) {
    //       this.controlDir.control.setValidators(allValidators);
    //       this.controlDir.control.updateValueAndValidity();
    //     }
    //   }
    // });

  }

  setPhoneNumber(event : Event) {
    this.phoneNumber = event.target ? (event.target as HTMLInputElement).value : '';
    this.valueChange.emit(this.phoneNumber);
    this._onChange(this.phoneNumber ? true : false);
  }

  onBlur( $event: any ) {
    this._onTouched($event);
  }

  writeValue(value: any): void {
    if  (value !== undefined ) {
      // phoneNumber is where the actual data is displayed to user for this
      // component
      this.phoneNumber = value;
    }
  }

  private validateSelf() {
    const value = this.phoneNumber;
    const phoneLength = this.allowInternational ? 11 : 10;

    if (value) {
      const stripped = value
        .replace(/_/g, '') // remove underlines
        .replace(/\s/g, '') // spaces
        .replace(/\+|-/g, '') // + or - symbol
        .replace('(', '')
        .replace(')', '');

      const valid = stripped.length === phoneLength;
      return valid ? null : { incompleteValue: true };

    }
    return null;
  }
}
