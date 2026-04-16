import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { AddressComponent } from './address.component';
import { Address } from '../../models/address.model';
import { CANADA, COUNTRY_LIST } from '../country/country.component';
import {
  BRITISH_COLUMBIA,
  PROVINCE_LIST,
} from '../province/province.component';

function createComponent() {
  const fixture = TestBed.createComponent(AddressComponent);
  const component = fixture.componentInstance;
  // Provide a minimal Address so ngOnInit doesn't error on undefined addr
  component['addr'] = new Address();
  return { fixture, component };
}

describe('AddressComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressComponent, FormsModule],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it('should default to Canada as country', () => {
    const { component } = createComponent();
    component.countryList = COUNTRY_LIST;
    component.defaultCountry = CANADA;
    component.provinceList = PROVINCE_LIST;
    const addr = new Address();
    addr.country = '';
    component['addr'] = addr;
    component.setCountry(CANADA);
    expect(component['addr'].country).toBe(CANADA);
  });

  it('isCanada() should return true when country is Canada', () => {
    const { component } = createComponent();
    component['addr'] = new Address();
    component['addr'].country = CANADA;
    expect(component.isCanada()).toBe(true);
  });

  it('isCanada() should return false for non-Canadian addresses', () => {
    const { component } = createComponent();
    component['addr'] = new Address();
    component['addr'].country = 'US';
    expect(component.isCanada()).toBe(false);
  });

  it('useAddressValidator should return false when disableGeocoder is true', () => {
    const { component } = createComponent();
    component.disableGeocoder = true;
    component['addr'] = new Address();
    component['addr'].country = CANADA;
    expect(component.useAddressValidator).toBe(false);
  });

  it('useAddressValidator should return true for Canadian addresses with geocoder enabled', () => {
    const { component } = createComponent();
    component.disableGeocoder = false;
    component['addr'] = new Address();
    component['addr'].country = CANADA;
    expect(component.useAddressValidator).toBe(true);
  });

  it('setProvince() should update addr.province and emit addressChange', () => {
    const { component } = createComponent();
    component['addr'] = new Address();
    jest.spyOn(component.addressChange, 'emit');
    component.setProvince(BRITISH_COLUMBIA);
    expect(component['addr'].province).toBe(BRITISH_COLUMBIA);
    expect(component.addressChange.emit).toHaveBeenCalled();
  });

  it('setPostalCode() should update addr.postal', () => {
    const { component } = createComponent();
    component['addr'] = new Address();
    component.setPostalCode('V8V 1A1');
    expect(component['addr'].postal).toBe('V8V 1A1');
  });

  it('addLine() should show line 2 first', () => {
    const { component } = createComponent();
    component.addLine();
    expect(component.showLine2).toBe(true);
    expect(component.showLine3).toBe(false);
  });

  it('addLine() should show line 3 after line 2', () => {
    const { component } = createComponent();
    component.showLine2 = true;
    component.addLine();
    expect(component.showLine3).toBe(true);
  });

  it('removeLine() should hide the specified line', () => {
    const { component } = createComponent();
    const addr = new Address();
    addr.addressLine2 = '  Apt 2';
    component['addr'] = addr;
    component.showLine2 = true;
    component.removeLine(2);
    expect(component.showLine2).toBe(false);
  });

  it('writeValue() should set addr when value is provided', () => {
    const { component } = createComponent();
    const addr = new Address();
    addr.city = 'Victoria';
    component.writeValue(addr);
    expect(component['addr'].city).toBe('Victoria');
  });

  it('setStreetAddress() should clear related fields when value is empty', () => {
    const { component } = createComponent();
    const addr = new Address();
    addr.city = 'Victoria';
    addr.postal = 'V8V 1A1';
    component['addr'] = addr;
    component.disableGeocoder = false;
    component.setStreetAddress('');
    expect(component['addr'].city).toBe('');
    expect(component['addr'].postal).toBe('');
  });
});
