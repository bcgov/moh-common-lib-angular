import {
  Component,
  Input,
  Optional,
  Self,
  Output,
  EventEmitter,
  OnInit } from '@angular/core';
import { FormsModule, NgControl, ValidationErrors } from '@angular/forms';
import { AbstractFormControl } from '../../models/abstract-form-control';
import { ErrorMessage, LabelReplacementTag } from '../../models/error-message.interface';
import { CommonModule } from '@angular/common';
import { ErrorContainerComponent } from '../error-container/error-container.component';

interface ErrorMessageExtended extends ErrorMessage {
  invalidEmail: string;
  invalidChars: string;
  [key: string]: string;
}

/**
 * TODO DOCUMENT NEED TO USE NGMODEL FOR REQUIRED TO WORK. Also test with reactive forms to see if still nec
 */
@Component({
  selector: 'common-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss'],
    imports: [
    CommonModule, 
    FormsModule, 
    ErrorContainerComponent,
  ],
})
export class EmailComponent extends AbstractFormControl implements OnInit {

  @Input() label: string = 'Email';
  @Input() maxlength: string = '255';
  @Input() labelforId: string = 'email_' + this.objectId;
  @Input() required: boolean = false;

  @Input()
  set value( val: string ) {
    if ( val ) {
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
    required: `${LabelReplacementTag} is required.`,
    invalidEmail: `${LabelReplacementTag} must be properly formatted (e.g. name@domain.com)`,
    invalidChars: `${LabelReplacementTag} must contain letters, numbers and/or symbols(e.g. #, @, !).`
  };

  private _formatCriteria: RegExp = /^(\S+)@(\S+)\.(\S+)$/;
  private _asciiPrintable: RegExp = /^[ -~]+$/;

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
    this.email = value;
    this._onChange( true );
    this.valueChange.emit( value );
  }

  onBlur( event: any ) {
    this._onTouched( event );
    this.blur.emit( event.target.value );
  }

  writeValue( value: any ): void {
    if ( value ) {
      this.email = value;
    }
  }

  private validateSelf(): ValidationErrors | null {

    if ( this.email ) {

      let result = this._formatCriteria.test( this.email );
      if ( result ) {
        result = this._asciiPrintable.test( this.email );
        return result ? null : { invalidChars: true };
      }
      return { invalidEmail: true };
    }
    return null;
  }
}
