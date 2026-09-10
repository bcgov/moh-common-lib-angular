import {
  forwardRef,
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Person } from '../../models/person.model';
import { Base } from '../../models/base';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { NameComponent } from '../name/name.component';

export interface FullNameErrorMsg {
  required?: string;
  pattern?: string;
}

/**
 * FullNameComponent includes a first, middle, and last name field.  If you only
 * need an individual field, @see NameComponent.
 *
 * The component holds a Person, which is always a truthy object, so Angular's own
 * RequiredValidator on the host element can never see a blank name. The component
 * reports the error itself through NG_VALIDATORS instead: while `required` is set,
 * a blank last name yields `{ required: true }` on the host control. First and
 * middle names are always optional. The host owns the message, since the inner
 * fields carry no control of their own to render it against.
 *
 * @example
 *          <common-full-name [(person)]='person'></common-full-name>
 *          <common-full-name formControlName='person' [required]='false'></common-full-name>
 *
 * @export
 */
@Component({
  selector: 'common-full-name',
  templateUrl: './full-name.component.html',
  styleUrls: ['./full-name.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => FullNameComponent),
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: forwardRef(() => FullNameComponent),
    },
  ],
  imports: [NameComponent],
})
export class FullNameComponent
  extends Base
  implements ControlValueAccessor, Validator, OnInit, OnChanges
{
  @Input() person!: Person;
  @Output() personChange = new EventEmitter<Person>();
  @Input() required: boolean = true;
  @Input() showError!: boolean;
  @Input() firstNamelabel: string = 'First Name';
  @Input() middleNamelabel: string = 'Middle Name';
  @Input() lastNamelabel: string = 'Last Name';
  @Input() disabled: boolean = false;

  firstName: string = '';
  middleName: string = '';
  lastName: string = '';

  public NameRegEx: string = "^[a-zA-Z][a-zA-Z\\-.' ]*$";

  public errMsg!: FullNameErrorMsg;
  // default messages
  private requiredMsgSeg: string = 'is required';
  private pattern: string =
    'Must begin with a letter followed by a letters, hyphen, period, apostrophe, or blank character';

  public _onChange = (_: any) => {};
  public _onTouched = () => {};

  constructor() {
    super();
  }

  ngOnInit() {
    if (this.person) {
      this.firstName = this.person.firstName ? this.person.firstName : '';
      this.lastName = this.person.lastName ? this.person.lastName : '';
      this.middleName = this.person.middleName ? this.person.middleName : '';
    }

    this.errMsg = {
      required: this.requiredMsgSeg,
      pattern: this.pattern,
    };
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  writeValue(value: any): void {
    this.person = value ? value : new Person();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['required']) {
      this.onValidatorChange();
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const person: Person = control.value ? control.value : this.person;

    if (this.required && !person?.lastName?.trim()) {
      return { required: true };
    }
    return null;
  }

  /**
   * Writes one name back onto the person and tells the host control, so that it
   * turns dirty and runs its validators again. Without this the control keeps the
   * value it was given and never revalidates, even though the person it holds has
   * been changed underneath it.
   */
  setName(field: 'firstName' | 'middleName' | 'lastName', value: string) {
    this.person[field] = value;
    this._onChange(this.person);
    this.personChange.emit(this.person);
  }

  onBlur() {
    this._onTouched();
  }

  private onValidatorChange = () => {};
}
