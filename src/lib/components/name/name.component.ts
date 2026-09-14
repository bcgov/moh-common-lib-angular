import {
  Component,
  Input,
  Optional,
  Self,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import {
  ControlValueAccessor,
  NgControl,
  ValidationErrors,
  FormsModule,
} from '@angular/forms';
import { AbstractFormControl } from '../../models/abstract-form-control';
import {
  LabelReplacementTag,
  ErrorMessage,
  RequiredMsg,
} from '../../models/error-message.interface';
import { CommonModule } from '@angular/common';
import { ErrorContainerComponent } from '../error-container/error-container.component';

interface ErrorMessageExtended extends ErrorMessage {
  invalid: string;
  invalidChar: string;
  [key: string]: string;
}

/**
 * Valid characters for a name: must begin with a letter, followed by letters,
 * hyphens, periods, apostrophes or blanks.
 */
const nameCriteria = /^[a-zA-Z][a-zA-Z\-.' ]*$/;

/**
 * Valid characters for initials, used when maxlength is 1: exactly one letter.
 * Both ends are anchored so the expression cannot backtrack over the input.
 */
const initialCriteria = /^[a-zA-Z]$/;

/**
 * A single name field: first, middle or last.
 * For all three at once, see FullNameComponent.
 *
 * @example
 *   <common-name name="firstName" [(ngModel)]="person.firstName" [required]="true">
 *   </common-name>
 *
 *   Set maxlength to 1 for an initial, which validates as a single letter:
 *   <common-name name="middleInitial" [(ngModel)]="person.initial" maxlength="1">
 *   </common-name>
 */
@Component({
  selector: 'common-name',
  templateUrl: './name.component.html',
  styleUrls: ['./name.component.scss'],
  imports: [CommonModule, FormsModule, ErrorContainerComponent],
})
export class NameComponent
  extends AbstractFormControl
  implements OnInit, ControlValueAccessor
{
  @Input() override disabled = false;
  @Input() label = 'Name';
  @Input() maxlength = '255';
  @Input() labelforId = 'name_' + this.objectId;
  @Input() required = false;

  @Input()
  set value(val: string) {
    if (val) {
      this.nameStr = val;
    }
  }
  get value() {
    return this.nameStr;
  }

  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() blur = new EventEmitter<any>();

  public nameStr = '';

  override _defaultErrMsg: ErrorMessageExtended = {
    required: RequiredMsg,
    invalid:
      LabelReplacementTag +
      ' must begin with a letter and cannot include special ' +
      'characters except hyphens, periods, apostrophes and blank characters.',
    invalidChar: `${LabelReplacementTag} must be a letter.`, // for Initials when maxlength is 1
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
    this.nameStr = value;
    this._onChange(value);
    this.valueChange.emit(value);
  }

  onBlur(event: any) {
    this._onTouched(event);
    this.blur.emit(event.target.value);
  }

  writeValue(value: any): void {
    if (value) {
      this.nameStr = value;
    }
  }

  get maxLenAsNumber(): number {
    return Number.parseInt(this.maxlength, 10);
  }

  private validateSelf(): ValidationErrors | null {
    const maxlen = Number.parseInt(this.maxlength, 10);
    if (this.nameStr) {
      if (maxlen > 1) {
        return nameCriteria.test(this.nameStr) ? null : { invalid: true };
      } else {
        return initialCriteria.test(this.nameStr)
          ? null
          : { invalidChar: true };
      }
    }
    return null;
  }
}
