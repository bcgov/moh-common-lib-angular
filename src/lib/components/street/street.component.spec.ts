import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StreetComponent } from './street.component';

describe('StreetComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreetComponent, HttpClientTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(StreetComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
