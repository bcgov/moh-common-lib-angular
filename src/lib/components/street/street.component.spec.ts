import { Component, ViewChild } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NgForm,
  NgModel,
  ReactiveFormsModule,
} from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TypeaheadDirective } from 'ngx-bootstrap/typeahead';
import { Observable, of } from 'rxjs';
import { StreetComponent } from './street.component';
import {
  GeoAddressResult,
  GeocoderService,
} from '../../services/geocoder.service';
import { CANADA } from '../country/country.component';
import { BRITISH_COLUMBIA } from '../province/province.component';
import { setInput } from '../../../helpers/test-helpers';

@Component({
  template: `
    <form>
      <common-street name="street" [(ngModel)]="streetValue"></common-street>
    </form>
  `,
  imports: [FormsModule, StreetComponent],
})
class NgModelHostComponent {
  @ViewChild(StreetComponent) streetComponent!: StreetComponent;
  streetValue = '';
}

@Component({
  template: `
    <form [formGroup]="form">
      <common-street formControlName="street"></common-street>
    </form>
  `,
  imports: [ReactiveFormsModule, StreetComponent],
})
class ReactiveHostComponent {
  @ViewChild(StreetComponent) streetComponent!: StreetComponent;
  form = new FormGroup({ street: new FormControl('') });
}

/**
 * The geocoder result the stubbed service returns. fullAddress is what the
 * typeahead shows and writes back through the inner ngModel;
 * street/city/province/country are what (select) hands the consumer.
 */
const GEO_RESULT: GeoAddressResult = {
  fullAddress: '1012 Douglas St, Victoria, BC',
  street: '1012 Douglas St',
  city: 'Victoria',
  province: 'XX',
  country: 'XX',
};

/**
 * Stands in for GeocoderService so no test can reach
 * https://geocoder.api.gov.bc.ca. The spec also asserts through
 * HttpTestingController that HttpClient saw no requests at all.
 */
class GeocoderServiceStub {
  // jest.fn records the search term it was called with, so the parameter is
  // not declared here.
  lookup = jest.fn(
    (): Observable<GeoAddressResult[]> => of([{ ...GEO_RESULT }])
  );
}

@Component({
  template: `
    <form [formGroup]="form">
      <common-street
        formControlName="street"
        [useGeoCoder]="true"
        (select)="selected = $event"></common-street>
    </form>
  `,
  imports: [ReactiveFormsModule, StreetComponent],
})
class GeoCoderReactiveHostComponent {
  @ViewChild(StreetComponent) streetComponent!: StreetComponent;
  form = new FormGroup({ street: new FormControl('') });
  selected: GeoAddressResult | null = null;
}

@Component({
  template: `
    <form>
      <common-street
        name="street"
        [(ngModel)]="streetValue"
        [useGeoCoder]="true"></common-street>
    </form>
  `,
  imports: [FormsModule, StreetComponent],
})
class GeoCoderNgModelHostComponent {
  @ViewChild(StreetComponent) streetComponent!: StreetComponent;
  @ViewChild(NgForm) ngForm!: NgForm;
  streetValue = '';
}

/**
 * The geocoder branch with no (select) listener at all. A consumer that binds
 * only formControlName has nowhere else to read the chosen address from, so
 * the control itself has to end up holding the street.
 */
@Component({
  template: `
    <form [formGroup]="form">
      <common-street
        formControlName="street"
        [useGeoCoder]="true"></common-street>
    </form>
  `,
  imports: [ReactiveFormsModule, StreetComponent],
})
class GeoCoderNoSelectHostComponent {
  @ViewChild(StreetComponent) streetComponent!: StreetComponent;
  form = new FormGroup({ street: new FormControl('') });
}

@Component({
  template: `
    <form [formGroup]="form">
      <common-street formControlName="street"></common-street>
    </form>
  `,
  imports: [ReactiveFormsModule, StreetComponent],
})
class PlainReactiveHostComponent {
  @ViewChild(StreetComponent) streetComponent!: StreetComponent;
  form = new FormGroup({ street: new FormControl('') });
}

/** A keyup that onKeyUp does not filter out (not enter, not tab). */
function typedKeyUp(): KeyboardEvent {
  const event = new KeyboardEvent('keyup', { bubbles: true });
  Object.defineProperty(event, 'keyCode', { get: () => 83 });
  return event;
}

describe('StreetComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreetComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(StreetComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render an input element', () => {
    const fixture = TestBed.createComponent(StreetComponent);
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
  });

  describe('inside a template-driven form', () => {
    let fixture: ComponentFixture<NgModelHostComponent>;
    let host: NgModelHostComponent;

    // fakeAsync, not async/await: NgForm.addControl (and NgModel's own
    // model-to-view sync) resolve through a shared, module-level
    // Promise.resolve().then(...) inside @angular/forms. Awaiting
    // compileComponents() in a real async beforeEach lets that first
    // registration resolve on the real microtask queue, outside any
    // fakeAsync zone. A later fakeAsync test's tick() cannot flush a
    // microtask chain that was rooted outside its own zone, so the
    // model-to-view update from a second [(ngModel)] change never lands.
    // Keeping setup and assertions inside one fakeAsync zone, with an
    // explicit tick() after the first detectChanges(), avoids that split.
    beforeEach(fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [NgModelHostComponent],
        providers: [provideHttpClient(), provideHttpClientTesting()],
      }).compileComponents();

      fixture = TestBed.createComponent(NgModelHostComponent);
      host = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should show the model value in the input', fakeAsync(() => {
      host.streetValue = '123 Main St';
      fixture.detectChanges();
      // NgModel routes every change after the first registration through
      // _updateValue(), which is itself a Promise.then() callback - it does
      // not write the DOM synchronously. tick() flushes that microtask, then
      // a second detectChanges() renders the now-updated `street` field
      // through the component's [value] binding.
      tick();
      fixture.detectChanges();
      const input: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      expect(input.value).toBe('123 Main St');
    }));

    it('should update the model when the input value changes', () => {
      // The component listens for 'change', not 'input'; setInput fires the
      // same input/change/blur trio a real user interaction produces.
      setInput(
        fixture.debugElement,
        '456 Oak Ave',
        host.streetComponent.labelforId
      );
      fixture.detectChanges();
      expect(host.streetValue).toBe('456 Oak Ave');
    });
  });

  describe('inside a reactive form', () => {
    let fixture: ComponentFixture<ReactiveHostComponent>;
    let host: ReactiveHostComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ReactiveHostComponent],
        providers: [provideHttpClient(), provideHttpClientTesting()],
      }).compileComponents();

      fixture = TestBed.createComponent(ReactiveHostComponent);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should show the patched control value in the input', () => {
      host.form.patchValue({ street: '789 Elm St' });
      fixture.detectChanges();
      const input: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      expect(input.value).toBe('789 Elm St');
    });

    it('should update the control when the input value changes', () => {
      // The component listens for 'change', not 'input'; setInput fires the
      // same input/change/blur trio a real user interaction produces.
      setInput(
        fixture.debugElement,
        '321 Pine Rd',
        host.streetComponent.labelforId
      );
      fixture.detectChanges();
      expect(host.form.get('street')?.value).toBe('321 Pine Rd');
    });

    it('should redraw the input when the control is reset to a value it already holds internally', () => {
      setInput(
        fixture.debugElement,
        '654 Fir St',
        host.streetComponent.labelforId
      );
      fixture.detectChanges();
      expect(host.form.get('street')?.value).toBe('654 Fir St');

      // Programmatic reset to the stale internal value. If the component
      // never records the typed value on its own field, this write looks
      // unchanged to Angular's binding and the DOM keeps showing the
      // earlier, un-cleared text.
      host.form.get('street')!.setValue('');
      fixture.detectChanges();

      const input: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      expect(input.value).toBe('');
    });

    it('emits valueChange once per commit rather than once per keystroke', () => {
      const emissions: string[] = [];
      host.streetComponent.valueChange.subscribe((value) =>
        emissions.push(value)
      );

      const input: HTMLInputElement = fixture.nativeElement.querySelector(
        '#' + host.streetComponent.labelforId
      );
      input.value = 'a';
      input.dispatchEvent(new Event('input'));
      input.value = 'ab';
      input.dispatchEvent(new Event('input'));
      input.value = 'abc';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('change'));

      expect(emissions).toEqual(['abc']);
    });
  });
});

/**
 * The typeahead container leaves a pending timer behind while it is open.
 * Destroying the fixture disposes the component loader so the fakeAsync zone
 * drains cleanly.
 */
function closeTypeahead(fixture: ComponentFixture<unknown>): void {
  fixture.destroy();
  tick();
}

describe('StreetComponent with useGeoCoder', () => {
  let fixture: ComponentFixture<GeoCoderReactiveHostComponent>;
  let host: GeoCoderReactiveHostComponent;
  let geocoder: GeocoderServiceStub;
  let httpMock: HttpTestingController;

  // fakeAsync rather than an async beforeEach for the reason spelled out on
  // the template-driven block above: @angular/forms drives model-to-view
  // updates off a module-level resolved promise, and a chain rooted outside
  // the fakeAsync zone cannot be flushed by tick() inside it.
  beforeEach(fakeAsync(() => {
    geocoder = new GeocoderServiceStub();

    TestBed.configureTestingModule({
      imports: [GeoCoderReactiveHostComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        // TypeaheadContainerComponent animates its dropdown with a synthetic
        // @typeaheadAnimation property, which needs an animations provider.
        provideNoopAnimations(),
        { provide: GeocoderService, useValue: geocoder },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(GeoCoderReactiveHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    tick();
  }));

  afterEach(() => {
    // GeocoderService is stubbed, so nothing should have gone near HttpClient
    // and nothing can reach https://geocoder.api.gov.bc.ca. verify() fails
    // loudly if any request was opened.
    httpMock.verify();
  });

  function geocoderInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector(
      '#' + host.streetComponent.labelforId
    );
  }

  /** Only valid inside fakeAsync: the tick(0) between the two events matters. */
  function typeIntoGeocoderInput(value: string): HTMLInputElement {
    const input = geocoderInput();
    input.value = value;
    // DefaultValueAccessor listens for 'input', which drives (ngModelChange)
    // and so onValueChange; TypeaheadDirective also listens for 'input' and
    // subscribes to typeaheadList$ after its own zero-delay debounce.
    input.dispatchEvent(new Event('input'));
    // A real browser fires 'input' while the key is down and 'keyup' when it
    // is released, so that zero-delay debounce has already run by then.
    // Firing both in one synchronous block instead would drop the search
    // term: searchText$ is a plain Subject with no replay, so a next() before
    // the typeahead has subscribed goes nowhere.
    tick(0);
    input.dispatchEvent(typedKeyUp());
    return input;
  }

  it('renders the typeahead input, not the plain one', () => {
    const streetDe = fixture.debugElement.query(By.directive(StreetComponent));
    const inputs = streetDe.queryAll(By.css('input'));

    expect(inputs.length).toBe(1);
    // The typeahead directive is only on the geocoder branch of the template.
    expect(inputs[0].injector.get(TypeaheadDirective, null)).toBeTruthy();
    expect(inputs[0].injector.get(NgModel, null)).toBeTruthy();
  });

  it('queries the geocoder only after the 500ms debounce', fakeAsync(() => {
    typeIntoGeocoderInput('1012 Doug');

    tick(499);
    expect(geocoder.lookup).not.toHaveBeenCalled();

    tick(1);
    expect(geocoder.lookup).toHaveBeenCalledTimes(1);
    expect(geocoder.lookup).toHaveBeenCalledWith('1012 Doug');

    tick();
    fixture.detectChanges();
    closeTypeahead(fixture);
  }));

  it('collapses two keystrokes inside the debounce window into one lookup', fakeAsync(() => {
    typeIntoGeocoderInput('1012 Do');
    tick(300);
    typeIntoGeocoderInput('1012 Doug');
    tick(300);

    expect(geocoder.lookup).not.toHaveBeenCalled();

    tick(200);
    expect(geocoder.lookup).toHaveBeenCalledTimes(1);
    expect(geocoder.lookup).toHaveBeenCalledWith('1012 Doug');

    tick();
    fixture.detectChanges();
    closeTypeahead(fixture);
  }));

  it('emits (select) with the geocoder defaults and writes the street when a suggestion is chosen', fakeAsync(() => {
    typeIntoGeocoderInput('1012 Doug');
    tick(500);
    tick();
    fixture.detectChanges();

    const option: HTMLButtonElement =
      fixture.nativeElement.querySelector('button.dropdown-item') ??
      document.querySelector('button.dropdown-item');
    expect(option).toBeTruthy();
    expect(option.textContent).toContain('1012 Douglas St, Victoria, BC');

    option.click();
    fixture.detectChanges();
    // TypeaheadContainerComponent.selectMatch defers typeaheadOnSelect by a
    // setTimeout, so (select) has not fired yet at this point.
    expect(host.selected).toBeNull();

    tick();
    fixture.detectChanges();

    expect(host.selected).toBeTruthy();
    expect(host.selected!.street).toBe('1012 Douglas St');
    expect(host.selected!.city).toBe('Victoria');
    // onSelect overwrites whatever the API returned with the fixed defaults.
    expect(host.selected!.country).toBe(CANADA);
    expect(host.selected!.province).toBe(BRITISH_COLUMBIA);

    expect(host.streetComponent.street).toBe('1012 Douglas St');

    // The inner [ngModel]="street" pushes model to view through a microtask,
    // so the rendered input only catches up on the next tick. Until it does it
    // is still showing the full address the typeahead put there.
    tick();
    expect(geocoderInput().value).toBe('1012 Douglas St');

    closeTypeahead(fixture);
  }));

  it('writes an outer control value through to the typeahead input', fakeAsync(() => {
    host.form.get('street')!.setValue('900 Blanshard St');
    fixture.detectChanges();
    // The inner ngModel pushes model to view through a microtask rather than
    // synchronously, so the DOM needs a tick and a second pass.
    tick();
    fixture.detectChanges();

    expect(host.streetComponent.street).toBe('900 Blanshard St');
    expect(geocoderInput().value).toBe('900 Blanshard St');
  }));

  it('writes typed text back out to the outer control', fakeAsync(() => {
    typeIntoGeocoderInput('900 Blanshard St');
    fixture.detectChanges();

    expect(host.form.get('street')!.value).toBe('900 Blanshard St');

    tick(500);
    tick();
    fixture.detectChanges();
    closeTypeahead(fixture);
  }));
});

describe('StreetComponent with useGeoCoder and no (select) listener', () => {
  let fixture: ComponentFixture<GeoCoderNoSelectHostComponent>;
  let host: GeoCoderNoSelectHostComponent;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [GeoCoderNoSelectHostComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: GeocoderService, useValue: new GeocoderServiceStub() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GeoCoderNoSelectHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    tick();
  }));

  it('writes the street, not the full address, into the bound control when a suggestion is chosen', fakeAsync(() => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      '#' + host.streetComponent.labelforId
    );
    input.value = '1012 Doug';
    input.dispatchEvent(new Event('input'));
    tick(0);
    input.dispatchEvent(typedKeyUp());
    tick(500);
    tick();
    fixture.detectChanges();

    const option: HTMLButtonElement =
      fixture.nativeElement.querySelector('button.dropdown-item') ??
      document.querySelector('button.dropdown-item');
    expect(option).toBeTruthy();

    // Selecting pushes the option value, the full address, through the inner
    // ngModel and into the control first. onSelect then has to write the
    // street back over it.
    option.click();
    fixture.detectChanges();
    expect(host.form.get('street')!.value).toBe(GEO_RESULT.fullAddress);

    // TypeaheadContainerComponent.selectMatch defers typeaheadOnSelect by a
    // setTimeout, so onSelect has not run until this tick.
    tick();
    fixture.detectChanges();

    expect(host.form.get('street')!.value).toBe('1012 Douglas St');
    expect(host.streetComponent.street).toBe('1012 Douglas St');

    // The inner [ngModel]="street" pushes model to view through a microtask,
    // so the rendered input only catches up on the next tick. Until it does it
    // is still showing the full address the typeahead put there.
    tick();
    expect(input.value).toBe('1012 Douglas St');

    closeTypeahead(fixture);
  }));
});

describe('StreetComponent inner ngModel isolation with useGeoCoder', () => {
  let fixture: ComponentFixture<GeoCoderNgModelHostComponent>;
  let host: GeoCoderNgModelHostComponent;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [GeoCoderNgModelHostComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: GeocoderService, useValue: new GeocoderServiceStub() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GeoCoderNgModelHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    tick();
  }));

  it('registers only the outer control with the ambient NgForm', () => {
    // The geocoder branch adds an ngModel on the inner input purely so
    // TypeaheadDirective can inject an NgControl. {standalone: true} must
    // keep it out of the surrounding form.
    expect(Object.keys(host.ngForm.control.controls)).toEqual(['street']);
  });

  it('round-trips a value through the outer [(ngModel)]', fakeAsync(() => {
    host.streetValue = '1012 Douglas St';
    fixture.detectChanges();
    // Two microtask hops: the outer ngModel writes through the component's
    // writeValue, and the inner ngModel then pushes that to the DOM.
    tick();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      '#' + host.streetComponent.labelforId
    );
    expect(input.value).toBe('1012 Douglas St');

    input.value = '900 Blanshard St';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick();

    expect(host.streetValue).toBe('900 Blanshard St');
  }));
});

describe('StreetComponent without useGeoCoder', () => {
  let fixture: ComponentFixture<PlainReactiveHostComponent>;
  let host: PlainReactiveHostComponent;
  let geocoder: GeocoderServiceStub;

  beforeEach(async () => {
    geocoder = new GeocoderServiceStub();

    await TestBed.configureTestingModule({
      imports: [PlainReactiveHostComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        // TypeaheadContainerComponent animates its dropdown with a synthetic
        // @typeaheadAnimation property, which needs an animations provider.
        provideNoopAnimations(),
        { provide: GeocoderService, useValue: geocoder },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlainReactiveHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function plainInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector(
      '#' + host.streetComponent.labelforId
    );
  }

  it('renders the plain input with no typeahead and no ngModel attached', () => {
    const streetDe = fixture.debugElement.query(By.directive(StreetComponent));
    const inputs = streetDe.queryAll(By.css('input'));

    expect(inputs.length).toBe(1);
    expect(inputs[0].injector.get(TypeaheadDirective, null)).toBeNull();
    expect(inputs[0].injector.get(NgModel, null)).toBeNull();
  });

  it('shows the control value through the [value] binding, not ngModel', () => {
    host.form.get('street')!.setValue('789 Elm St');
    // No tick(): a [value] binding lands in the same change detection pass.
    // An ngModel here would still be showing the old text.
    fixture.detectChanges();

    expect(plainInput().value).toBe('789 Elm St');
  });

  it('commits on change, not on every input event', () => {
    const input = plainInput();

    input.value = 'abc';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.form.get('street')!.value).toBe('');

    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(host.form.get('street')!.value).toBe('abc');
  });

  it('never touches the geocoder', fakeAsync(() => {
    const input = plainInput();
    input.value = '1012 Doug';
    input.dispatchEvent(new Event('input'));
    tick(0);
    input.dispatchEvent(new Event('change'));
    input.dispatchEvent(typedKeyUp());
    tick(1000);

    expect(geocoder.lookup).not.toHaveBeenCalled();
  }));
});
