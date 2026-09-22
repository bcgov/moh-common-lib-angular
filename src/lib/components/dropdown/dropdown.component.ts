import {
  Component,
  Input,
  Output,
  EventEmitter,
  Optional,
  Self,
} from '@angular/core';
import { FormsModule, NgControl } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AbstractFormControl } from '../../models/abstract-form-control';
import {
  ErrorMessage,
  RequiredMsg,
} from '../../models/error-message.interface';
import { CommonModule } from '@angular/common';
import { ErrorContainerComponent } from '../error-container/error-container.component';

/**
 * A generic single-select dropdown, built on ng-select.
 *
 * `items` accepts either plain values (strings, numbers) or objects; there is no
 * `bindLabel`/`bindValue` override, so ng-select's own defaults apply. An object
 * item displays `item.label`, and the value written to `value`/`formControlName`
 * is the whole selected item, not just one of its fields.
 *
 * `required` only affects the rendered dropdown; it does not add a validator to
 * the outer form control. Add `Validators.required` where that control is built.
 *
 * @example
 *   <common-dropdown label="Administering for" formControlName="administeringFor"
 *                     [items]="administeringForOptions" [clearable]="false">
 *   </common-dropdown>
 */
@Component({
  selector: 'common-dropdown',
  templateUrl: './dropdown.component.html',
  imports: [CommonModule, FormsModule, NgSelectModule, ErrorContainerComponent],
})
export class DropdownComponent extends AbstractFormControl {
  @Input() label = 'Select an option';
  @Input() items: any[] = [];
  @Input() labelforId: string = 'dropdown_' + this.objectId;
  @Input() placeholder = '';
  @Input() required = false;
  @Input() clearable = true;
  @Input() addTag = false;
  @Input() addTagText = 'Add';

  @Input()
  set value(val: any) {
    if (val !== undefined) {
      this.selected = val;
    }
  }
  get value() {
    return this.selected;
  }

  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() blur: EventEmitter<any> = new EventEmitter<any>();

  selected: any;

  override _defaultErrMsg: ErrorMessage = {
    required: RequiredMsg,
  };

  constructor(@Optional() @Self() public controlDir: NgControl) {
    super();
    if (controlDir) {
      controlDir.valueAccessor = this;
    }
  }

  onValueChange(value: any) {
    this.selected = value;
    this._onChange(value);
    this.valueChange.emit(value);
  }

  onBlur(event: any) {
    this._onTouched(event);
    this.blur.emit(event);
  }

  writeValue(value: any): void {
    this.selected = value;
  }
}
