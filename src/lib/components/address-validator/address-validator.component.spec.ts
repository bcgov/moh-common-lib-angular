import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  AddressResult,
  AddressValidatorComponent,
} from './address-validator.component';

/** A keyup that onKeyUp does not filter out (not enter, not tab). */
function typedKeyUp(): KeyboardEvent {
  const event = new KeyboardEvent('keyup', { bubbles: true });
  Object.defineProperty(event, 'keyCode', { get: () => 83 });
  return event;
}

describe('AddressValidatorComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressValidatorComponent, HttpClientTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AddressValidatorComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

describe('AddressValidatorComponent with no serviceUrl', () => {
  let component: AddressValidatorComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressValidatorComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        // TypeaheadContainerComponent animates its dropdown with a synthetic
        // @typeaheadAnimation property, which needs an animations provider.
        provideNoopAnimations(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(AddressValidatorComponent);
    component = fixture.componentInstance;
    // ngOnInit builds typeaheadList$ from searchText$.
    fixture.detectChanges();
  });

  afterEach(() => {
    // With no URL there is nothing to request. verify() fails loudly if the
    // component opened one anyway.
    httpMock.verify();
  });

  it('emits an empty result list and leaves the field out of the error state', fakeAsync(() => {
    expect(component.serviceUrl).toBeUndefined();

    const emissions: AddressResult[][] = [];
    component.typeaheadList$.subscribe((results) => emissions.push(results));

    component.search = '101';
    component.onKeyUp(typedKeyUp());
    tick(500);

    expect(emissions).toEqual([[]]);
    expect(component.hasError).toBe(false);

    // catchError unsubscribes from the source, so an error on the first
    // search would also silence every search after it. A second, distinct
    // term has to still reach the subscriber.
    component.search = '1012';
    component.onKeyUp(typedKeyUp());
    tick(500);

    expect(emissions).toEqual([[], []]);
    expect(component.hasError).toBe(false);
  }));
});
