import {
  Component,
  Input,
  Output,
  EventEmitter,
  Optional,
  Self,
  OnInit,
} from '@angular/core';
import { FormsModule, NgControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { Observable, Subject, of } from 'rxjs';
import {
  GeoAddressResult,
  GeocoderService,
} from '../../services/geocoder.service';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { AbstractFormControl } from '../../models/abstract-form-control';
import {
  ErrorMessage,
  LabelReplacementTag,
  RequiredMsg,
} from '../../models/error-message.interface';
import { CANADA } from '../country/country.component';
import { BRITISH_COLUMBIA } from '../province/province.component';

/**
 * A street address field. With useGeoCoder set it offers typeahead suggestions
 * from the BC geocoder.
 *
 * @example
 *   <common-street name="street" [(ngModel)]="address.street" [required]="true">
 *   </common-street>
 *
 *   With geocoder suggestions, which arrive through (select):
 *   <common-street name="street" [(ngModel)]="address.street"
 *                  [useGeoCoder]="true" (select)="onGeoAddress($event)">
 *   </common-street>
 */
@Component({
  selector: 'common-street',
  templateUrl: './street.component.html',
  imports: [
    CommonModule,
    FormsModule,
    TypeaheadModule,
    ErrorContainerComponent,
  ],
})
export class StreetComponent extends AbstractFormControl implements OnInit {
  @Input() label: string = 'Full street address or rural route';
  @Input() maxlength: string = '250';
  @Input() labelforId: string = 'street_' + this.objectId;
  @Input() useGeoCoder: boolean = false;
  @Input() placeholder: string = 'Street name';
  @Input() required: boolean = false;

  @Input()
  set value(val: string) {
    if (val) {
      this.street = val;
    }
  }
  get value() {
    return this.street;
  }

  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

  @Output() blur: EventEmitter<any> = new EventEmitter<any>();

  @Output() select: EventEmitter<GeoAddressResult> =
    new EventEmitter<GeoAddressResult>();

  street: string = '';

  /**
   * The list of results, from API, that is passed to the typeahead list
   * Result from GeoCoderService address lookup
   */
  typeaheadList$: Observable<GeoAddressResult[]> | undefined;

  /** Search string to store result from GeoCoder request */
  private search: string | undefined;
  /** The subject that triggers on user text input and gets typeaheadList$ to update.  */
  private searchText$ = new Subject<string>();

  override _defaultErrMsg: ErrorMessage = {
    required: RequiredMsg,
    invalidChar:
      LabelReplacementTag +
      ' must contain letters, and numbers and may include special characters such as hyphen, ' +
      'period, apostrophe, number sign, ampersand and blank characters.',
  };

  constructor(
    @Optional() @Self() public controlDir: NgControl,
    private geocoderService: GeocoderService
  ) {
    super();
    if (controlDir) {
      controlDir.valueAccessor = this;
    }
  }

  override ngOnInit() {
    super.ngOnInit();

    // Set up for using GeoCoder
    this.typeaheadList$ = this.searchText$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      // Trigger the network request, get results
      switchMap((searchPhrase) => {
        return this.geocoderService.lookup(searchPhrase);
      }),
      catchError(() => this.onError())
    );
  }

  onValueChange(data: any) {
    let value: string = '';
    if (typeof data === 'string') {
      value = data;
    } else if (data && typeof data === 'object') {
      value = data.target.value;
    }
    this.street = value;
    if (this.useGeoCoder) {
      // set the search string
      this.search = value;
    }
    this._onChange(value);
    this.valueChange.emit(value);
  }

  onBlur(event: any) {
    this._onTouched(event);
    this.blur.emit(event);
  }

  writeValue(value: any): void {
    if (value !== undefined) {
      this.street = value;
    }
  }

  // @HostListener('keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    /**
     * Filter out 'enter' and other similar keyboard events that can trigger
     * when user is selecting a typeahead option instead of entering new text.
     * Without this filter, we do another HTTP request + force disiplay the UI
     * for now reason
     */
    if (event.keyCode === 13 || event.keyCode === 9) {
      // enter & tab
      return;
    }

    // search is only populated while useGeoCoder is on; an empty string
    // reaches distinctUntilChanged the same way a cleared field does.
    this.searchText$.next(this.search ?? '');
  }

  onError(): Observable<GeoAddressResult[]> {
    // Empty array simulates no result response, nothing for typeahead to iterate over
    return of([]);
  }

  onSelect(event: any): void {
    const data: GeoAddressResult = event.item;
    this.street = data.street;

    // The typeahead has already pushed its own option value, the full address,
    // through onValueChange and into the bound control. Write the street back
    // so the control, this component and the input all hold the street only.
    this._onChange(this.street);
    this.valueChange.emit(this.street);

    // Set to defaults in response
    data.country = CANADA;
    data.province = BRITISH_COLUMBIA;
    this.select.emit(data);
  }
}
