// TODO: code refactor
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, fakeAsync } from '@angular/core/testing';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SinComponent } from './sin.component';
import { provideNgxMask } from 'ngx-mask';
import { Component, ViewChildren, QueryList, OnInit, Type } from '@angular/core';
import { tickAndDetectChanges, getDebugLabel, getDebugElement } from '../../../helpers/test-helpers';
import { BrowserModule } from '@angular/platform-browser';
import { commonDuplicateCheck } from '../duplicate-check/duplicate-check.directive';

function createTestingModule<T>(cmp: Type<T>, template: string): ComponentFixture<SinReactTestComponent> {

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

  return TestBed.createComponent(cmp) as ComponentFixture<SinReactTestComponent>;
}

@Component({
  template: ``,
})
class SinTestComponent {
  @ViewChildren(SinComponent) sinComponent!: QueryList<SinComponent>;

  sin1!: string;
  sin2!: string;

  defaultLabel: string = 'Social Insurance Number (SIN)';
}

@Component({
  template: ``,
  imports: [
    SinComponent, FormsModule, ReactiveFormsModule],
})
class SinReactTestComponent extends SinTestComponent implements OnInit {

  form!: FormGroup;

  constructor( private fb: FormBuilder ) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group({
      sin1: [ this.sin1 ],
      sin2: [ this.sin2 ,  commonDuplicateCheck( ['123456782'] ) ]

    });
  }
}

describe('Sin.Component', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule ],
      providers: [provideNgxMask()],
    }).compileComponents();
  });

   it('should create', fakeAsync(() => {
      const fixture = createTestingModule( SinReactTestComponent,
        `<form [formGroup]="form">
          <common-sin name='sin1' formControlName='sin1'></common-sin>
         </form>`,
      );

      const component = fixture.componentInstance;
      tickAndDetectChanges( fixture );
      const de = getDebugElement( fixture, 'common-sin', 'sin1');
      const label = getDebugLabel( de, de.componentInstance.labelforId );

      expect( component.sinComponent ).toBeTruthy();
      expect( label ).toBe( component.defaultLabel );
      expect(de.componentInstance.controlDir.hasError('required')).toBeFalsy();
    }));

     it('should format input correctly with mask', fakeAsync(() => {
          const fixture = TestBed.createComponent(SinComponent);
          fixture.detectChanges();
      
          fixture.detectChanges();
          const inputEl = fixture.nativeElement.querySelector('input');
      
          inputEl.focus();
          inputEl.value = '123456782';
          inputEl.dispatchEvent(new Event('input'));
          inputEl.dispatchEvent(new Event('change'));
          inputEl.dispatchEvent(new Event('blur'));
              
          expect(inputEl.value).toBe('123 456 782');

        }));

     it('should be required', fakeAsync(() => {
      const fixture = createTestingModule( SinReactTestComponent,
        `<form [formGroup]="form">
          <common-sin name='sin1' formControlName='sin1' required></common-sin>
         </form>`
      );

      const component = fixture.componentInstance;
      tickAndDetectChanges( fixture );
  
      expect( component.sinComponent ).toBeTruthy();
      expect(component.form.get('sin1')?.hasError('required')).toBeTruthy();
    }));

     it('should be invalid', fakeAsync(() => {
      const fixture = createTestingModule( SinReactTestComponent,
        `<form [formGroup]="form">
          <common-sin name='sin1' formControlName='sin1'></common-sin>
         </form>`
      );

      const component = fixture.componentInstance;
      const sin1Control = component.form.get('sin1');
      if (sin1Control) {
        sin1Control.setValue('123456789');
      }
      tickAndDetectChanges( fixture );
      expect( component.sinComponent ).toBeTruthy();
      expect( component.form.get('sin1')?.hasError( 'invalid' ) ).toBeTruthy();
    }));

    it('should be valid', fakeAsync(() => {
      const fixture = createTestingModule( SinReactTestComponent,
        `<form [formGroup]="form">
          <common-sin name='sin1' formControlName='sin1'></common-sin>
         </form>`
      );

      const component = fixture.componentInstance;
       const sin1Control = component.form.get('sin1');
      if (sin1Control) {
        sin1Control.setValue('123456782');
      }
      tickAndDetectChanges( fixture );
      expect(component.sinComponent ).toBeTruthy();
    
      expect(sin1Control && sin1Control.valid).toBeTruthy();
 
    }));

     it('should be duplicate', fakeAsync(() => {
      const fixture = createTestingModule( SinReactTestComponent,
        `<form [formGroup]="form">
          <common-sin name='sin2' formControlName='sin2'></common-sin>
         </form>`
      );

      const component = fixture.componentInstance;
      const sin2Control = component.form.get('sin2');
      if (sin2Control) {
        sin2Control.setValue('123456782');
      }
      tickAndDetectChanges( fixture );
      expect( component.sinComponent ).toBeTruthy();
      const sin2 = component.form.get('sin2');
      expect(sin2 && sin2.hasError('duplicate')).toBeTruthy();
    }));

});



