import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AddressValidatorComponent } from './address-validator.component';

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
