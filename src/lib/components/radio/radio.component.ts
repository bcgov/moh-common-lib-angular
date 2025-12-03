// TODO: Code refactor
import { Component, EventEmitter, Input, Output, Optional, Self, OnInit } from '@angular/core';
import { AbstractFormControl } from '../../models/abstract-form-control';
import { LabelReplacementTag, ErrorMessage } from '../../models/error-message.interface';
import { FormsModule, NgControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ErrorContainerComponent } from '../error-container/error-container.component';

/**
 * RadioComponent is a single radio which can be used to have multiple radios
 * based on the radio label values.
 *
 * To display radio in a vertical style use display="table-row-group" by default
 * it shows in horizontal or inline display, display='inline-block' You can
 * have many radio's and the number is based on the Radio label Value. For 3
 * radio buttons, radioLabels value is of type IRadioItems[].
*
 * @example
 *
 *  Reactive Form
 *        <common-radio name='choice'
 *          label='Do you live in Canada'
 *          display='table-row-group'
 *          [radioLabels]=='[{label: "No", value: false},{label: "Yes", value: true}]'
 *          FormControlName='choice'>
 *        </common-radio>
 *
 *  Template Form
 *        <common-radio name='ageCategory'
 *          [(ngModel)]="age"
 *          label='How old are you?'
 *          display='table-row-group'
 *          [radioLabels]='[{label: "0-18 years", value: 0},{label: "19 years and older", value: 1}]'>
 *        </common-radio>
 *
 * @export
 *
 */
export interface IRadioItems {
  label: string;
  value: any;
  // TODO: Make value generic <T>
}
@Component({
  selector: 'common-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss'],
  imports: [CommonModule, FormsModule, ErrorContainerComponent],
})
export class RadioComponent extends AbstractFormControl implements OnInit {

  _value: any = '';
  override _defaultErrMsg: ErrorMessage = {
    required: `${LabelReplacementTag} is required.`
  };

  @Input() radioLabels: IRadioItems[] = [
    {label: 'No', value: false},
    {label: 'Yes', value: true}
  ];
  @Input() required: boolean = false;

  @Input() label: string = '';
  @Input()
  set value( val: any ) {
    this._value = val;
  }
  get value() {
    return this._value;
  }

  @Input() display: 'table-row-group' | 'inline-block'  = 'inline-block';
  @Input() instructionText: string = '';

  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();

  constructor( @Optional() @Self() public controlDir: NgControl ) {
    super();
    if ( controlDir ) {
      controlDir.valueAccessor = this;
    }
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  setStatus(val: any) {
    this._value = val;

    this._onChange(val);
    this._onTouched(event);
    this.valueChange.emit(val);
  }

  override registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  override registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  writeValue(value: any): void {
    this._value = value;
  }
}
