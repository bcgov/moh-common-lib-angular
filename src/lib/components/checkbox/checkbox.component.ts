
// TODO: Code refactor
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl, FormsModule } from '@angular/forms';
import { AbstractFormControl } from '../../models/abstract-form-control';
import { ErrorMessage, LabelReplacementTag } from '../../models/error-message.interface';
import { CommonModule } from '@angular/common';
import { ErrorContainerComponent } from '../error-container/error-container.component';

/**
 * Checkbox component is a input checkbox
 *
 * @example
 *       <common-checkbox #addressChangeChkBx
 *          label='Do you want to opt in?'
 *          errorMessageRequired = 'Opt in should be selected'
 *          (dataChange)="dataChange($event)"
 *           [(data)]='person.hasOpted' [disabled]="isDisabled"
 *          [required]="isrequired">
 *       </common-checkbox>
 *
 * @export
 */


@Component({
  selector: 'common-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  imports: [CommonModule, FormsModule, ErrorContainerComponent],
})
export class CheckboxComponent extends AbstractFormControl implements OnInit, ControlValueAccessor {
  defaultErrorMessage = '';

  /**
   * You can bind to [(data)] OR you can use [(ngModel)] but don't use both.
   */
  @Input() data = false;
  @Input() label = 'Default Checkbox';
  @Input() required = false;  // TOBE removed duing MSP stablization - then update MSP to use form control version
  @Output() dataChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('checkbox') checkbox: ElementRef | undefined;

  override _defaultErrMsg: ErrorMessage = {
    required: `${LabelReplacementTag} is required.`,
  };

  constructor( @Optional() @Self() public controlDir: NgControl ) {
    super();
    if ( controlDir ) {
      controlDir.valueAccessor = this;
    }
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  setCheckboxVal(event: boolean) {
    this.data = event;
    this.dataChange.emit(this.data);
    this._onChange(event);
    this._onTouched(event);
  }

  focus() {
    this.checkbox?.nativeElement.focus();
  }

  writeValue(value: never): void {
    if ( value !== undefined || value === null ) {
      this.data = value;
    }
  }
}
