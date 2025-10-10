import { ComponentFixture, ComponentFixtureAutoDetect, fakeAsync, TestBed } from '@angular/core/testing';
import { CityComponent } from './city.component';
import { Component, ViewChildren, QueryList, OnInit, Type } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { tickAndDetectChanges, getDebugElement, getDebugLabel, setInput} from '../../../helpers/test-helpers';
import { BrowserModule } from '@angular/platform-browser';

function createTestingModule<T>(cmp: Type<T>, template: string): ComponentFixture<CityReactTestComponent> {

  const importComp: any = [ BrowserModule, FormsModule, ReactiveFormsModule ];

  TestBed.configureTestingModule({
      declarations: [],
      imports: [
        importComp,      
      ],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
      ]
    }).overrideComponent(cmp, {
        set: {
          template: template
        }
      });

  TestBed.compileComponents();

  return TestBed.createComponent(cmp) as ComponentFixture<CityReactTestComponent>;
}

@Component({
  template: ``
})
class CityTestComponent {
  @ViewChildren(CityComponent) cityComponent!: QueryList<CityComponent>;

  city1!: string;
  city2!: string;

  defaultLabel: string = 'City';
}

@Component({
  template: ``,
  imports: [
    CityComponent, FormsModule, ReactiveFormsModule],
})
class CityReactTestComponent extends CityTestComponent implements OnInit {

  form!: FormGroup;

  constructor( private fb: FormBuilder ) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group({
      city1: [ this.city1 ],
      city2: [ this.city2 ]
    });
  }

  setCityRequired( phnFldName: string ) {
    const fld = this.form.controls[phnFldName];

    fld.setValidators( Validators.required );
    fld.updateValueAndValidity();
  }
}

describe('City.Component', () => {

    it('should create', fakeAsync(() => {
      const fixture = createTestingModule( CityReactTestComponent,
        `<form [formGroup]="form">
          <common-city name='city1' formControlName='city1'></common-city>
         </form>`
      );

        const de = getDebugElement( fixture, 'common-city', 'city1');
        const label = getDebugLabel( de, de.componentInstance.labelforId );

        expect( de ).toBeTruthy();
        expect( label ).toBe( fixture.componentInstance.defaultLabel );
      }));

      it('should be required', fakeAsync(() => {
        const fixture = createTestingModule( CityReactTestComponent,
          `<form [formGroup]="form">
            <common-city name='city1' formControlName='city1'></common-city>
           </form>`
        );

        fixture.componentInstance.setCityRequired( 'city1') ;
        tickAndDetectChanges( fixture );

        const de = getDebugElement( fixture, 'common-city', 'city1');

        expect( de ).toBeTruthy();
        expect( de.componentInstance.controlDir.hasError( 'required' ) ).toBeTruthy();
      }));

      it('should not have required error', fakeAsync(() => {
        const fixture = createTestingModule( CityReactTestComponent,
          `<form [formGroup]="form">
            <common-city name='city1' formControlName='city1'></common-city>
           </form>`
        );

        fixture.componentInstance.setCityRequired( 'city1' ) ;
        tickAndDetectChanges( fixture );

        const de = getDebugElement( fixture, 'common-city', 'city1');
        setInput( de, 'My City' );

        tickAndDetectChanges( fixture );
        expect( de.componentInstance.controlDir.hasError( 'required' ) ).toBeFalsy();
      }));

      it('should display value after dispatchEvent change', fakeAsync(() => {
          const inputValue = 'Victoria';
          const fixture = TestBed.createComponent(CityComponent);
          fixture.detectChanges();
      
          fixture.detectChanges();
          const inputEl = fixture.nativeElement.querySelector('input');
      
          inputEl.focus();
          inputEl.value = inputValue;
          inputEl.dispatchEvent(new Event('change'));
         
          expect(inputEl.value).toBe(inputValue);
      
        }));
});

