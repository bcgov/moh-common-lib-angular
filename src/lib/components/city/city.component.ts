import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  Optional,
  Self,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { AbstractFormControl } from '../../models/abstract-form-control';
import {
  ErrorMessage,
  LabelReplacementTag,
} from '../../models/error-message.interface';
import { CommonModule } from '@angular/common';
import { ErrorContainerComponent } from '../error-container/error-container.component';

interface ErrorMessageExtended extends ErrorMessage {
  invalidChar: string;
  maxlength: string;
  [key: string]: string;
}

@Component({
  selector: 'common-city',
  templateUrl: './city.component.html',
  imports: [CommonModule, FormsModule, ErrorContainerComponent],
})
export class CityComponent
  extends AbstractFormControl
  implements OnInit, ControlValueAccessor
{
  @Input() label: string = 'City';
  @Input() maxlength: string = '100';
  @Input() labelforId: string = 'city_' + this.objectId;
  @Input() placeholder: string = 'City name';
  @Input() required: boolean = false;

  @Input()
  set value(val: string) {
    if (val) {
      this.city = val;
    }
  }
  get value() {
    return this.city;
  }

  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() blur: EventEmitter<any> = new EventEmitter<any>();

  city: string = '';

  override _defaultErrMsg: ErrorMessageExtended = {
    required: LabelReplacementTag + ' is required.',
    invalidChar:
      LabelReplacementTag +
      ' must contain letters and may include numbers and special characters ' +
      'such as hyphens, periods, apostrophes and blank characters.',
    maxlength:
      LabelReplacementTag +
      ' exceeds the maximum number of allowable characters.',
  };

  constructor(@Optional() @Self() public controlDir: NgControl) {
    super();
    if (controlDir) {
      controlDir.valueAccessor = this;
    }
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  onValueChange(data: any) {
    let value: string = '';
    if (typeof data === 'string') {
      value = data;
    } else if (typeof data === 'object') {
      value = data.target.value;
    }
    if (value) {
      this.city = value;
      this._onChange(true);
      this.valueChange.emit(value);
    }
  }

  onBlur(event: any) {
    this._onTouched(event);
    this.blur.emit(event);
  }

  writeValue(value: string): void {
    if (value !== undefined) {
      this.city = value;
    }
  }
}
