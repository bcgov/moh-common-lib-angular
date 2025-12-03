
import { Component, EventEmitter, Input, Output, Optional, Self, OnInit, /*input*/} from '@angular/core';
//import { NUMBER, SPACE } from '../../models/mask.constants';
import { ControlValueAccessor, NgControl, ValidationErrors, FormsModule } from '@angular/forms';
import { ErrorMessage, LabelReplacementTag } from '../../models/error-message.interface';
import { AbstractFormControl } from '../../models/abstract-form-control';
import { CommonModule } from '@angular/common'; 
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

interface ErrorMessageExtended extends ErrorMessage {
  invalid: string;
  duplicate: string
  [key: string]: string;
}

@Component({
  selector: 'common-phn',
  templateUrl: './phn.component.html',
  standalone: true,
  // styleUrls: ['./phn.component.scss'],
  imports: [
    CommonModule, 
    FormsModule, 
    ErrorContainerComponent,
    NgxMaskDirective,
  ],
  providers: [provideNgxMask()],
})
export class PhnComponent extends AbstractFormControl implements OnInit, ControlValueAccessor {

  @Input() label = 'Personal Health Number (PHN)';
  @Input() placeholder = '1111 111 111';
  @Input() labelforId = 'phn_' + this.objectId;
  @Input() required = false;
  @Input() mask = '0000 000 000';
  
    // Self-Validation inputs
  @Input() isBCPhn = true;

  override _defaultErrMsg: ErrorMessageExtended = {
    required: `${LabelReplacementTag} is required.`,
    invalid: `${LabelReplacementTag} is invalid.`,
    duplicate: `${LabelReplacementTag} was already used for another family member.`,
  };

  @Input()
  set value( val: string ) {
    if ( val) {
      this.phn = val;
    }
  }
  get value() {
    return this.phn;
  }

  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() blur: EventEmitter<any> = new EventEmitter<any>();

  phn = '';

  //mask: any;

  constructor( @Optional() @Self() public controlDir: NgControl ) {
    super();
    if ( controlDir ) {
      controlDir.valueAccessor = this;
    }

  }

  override ngOnInit() {
    super.ngOnInit();

    this.registerValidation( this.controlDir, this.validateSelf );
  }

   onValueChange( event: Event ) {
    const target = event.target as HTMLSelectElement;
    const value = target.value;

    if ( value !== this.phn ) { // IE fix when focus does not display required error
      this.phn = value;
      this._onChange( true );
      this.valueChange.emit( value );
    }
  }

  onBlur( event: any ) {
    this._onTouched( event );
    this.blur.emit( event );
  }

  writeValue( value: any ): void {
    if ( value !== undefined ) {
      this.phn = value;
    }
  }

  private validateSelf(): ValidationErrors | null {

    const validatePhnResult = this.validatePhn();
    if ( validatePhnResult ) {
      return validatePhnResult;
    }
    return null;
   }

  private validatePhn(): ValidationErrors | null {

    if ( this.phn && this.phn.trim().length > 0 ) {

      // Init weights and other stuff
      const weights: number[] = [-1, 2, 4, 8, 5, 10, 9, 7, 3, -1];
      let sumOfRemainders = 0;

      // Clean up string
      const value = this.phn.trim();
      this.phn = value
                  .replace( /^0+/, '' ) // remove leading zeros
                  .replace(/_/g, '') // remove underlines
                  .replace(/\s/g, ''); // spaces

      // Test for length
      if (this.phn.length !== 10) {
        return { 'invalid': true };
      }
      // Look for a number that starts with 9 if BC only
      if (this.isBCPhn && this.phn[0] !== '9') {
        return { 'invalid': true };
      } else if (!this.isBCPhn && this.phn[0] === '9') { // Number cannot have 9
        return { 'invalid': true };
      }

      // Walk through each character
      for (let i = 0; i < this.phn.length; i++) {

        // pull out char
        const char = this.phn.charAt(i);

        // parse the number
        const num = Number(char);

        if (Number.isNaN(num)) {
          return { 'invalid': true };
        }

        // Only use the multiplier if weight is greater than zero
        let result = 0;
        if (weights[i] > 0) {
          // multiply the value against the weight
          result = num * weights[i];

          // divide by 11 and save the remainder
          result = result % 11;

          // add it to our sum
          sumOfRemainders += result;
        }
      }

      // mod by 11
      const checkDigit = 11 - (sumOfRemainders % 11);

      // if the result is 10 or 11, it is an invalid PHN
      if (checkDigit === 10 || checkDigit === 11) {
        return { 'invalid': true };
      }

      // Compare against 10th digitfinalDigit
      const finalDigit = Number(this.phn.substring(9, 10));
      if (checkDigit !== finalDigit) {
        return { 'invalid': true };
      }
    }
    return null;
  }


}
