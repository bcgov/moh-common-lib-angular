import { TestBed } from '@angular/core/testing';
import { CountryComponent } from './country.component';
import { FormsModule } from '@angular/forms';

describe('Country.Component', () => {
 
  beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [CountryComponent, FormsModule],
      }).compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(CountryComponent);
        const checkBox = fixture.componentInstance;
        expect(checkBox).toBeTruthy();
    });
});
