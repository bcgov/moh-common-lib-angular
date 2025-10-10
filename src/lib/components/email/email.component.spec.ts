// TODO: Code refactor
import { ComponentFixture, ComponentFixtureAutoDetect, fakeAsync, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { EmailComponent } from './email.component';

import { Component, ViewChildren, QueryList, OnInit, Type } from '@angular/core';
import { tickAndDetectChanges, getDebugLabel, setInput, getDebugElement } from '../../../helpers/test-helpers';
import { BrowserModule} from '@angular/platform-browser';


export function createTestingModule<T>(cmp: Type<T>, template: string): ComponentFixture<EmailReactTestComponent> {

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

  return TestBed.createComponent(cmp) as ComponentFixture<EmailReactTestComponent
>;
}

@Component({
  template: ``,
})
class EmailTestComponent {

  @ViewChildren(EmailComponent) emailComponent!: QueryList<EmailComponent>;

  email1!: string;
  email2!: string;

  defaultLabel: string = 'Email';
}

@Component({
  template: ``,
  imports: [
    EmailComponent, FormsModule, ReactiveFormsModule],
})
class EmailReactTestComponent extends EmailTestComponent implements OnInit {

  form!: FormGroup;

  constructor( private fb: FormBuilder ) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group({
      email1: [ this.email1 ],
      email2: [ this.email2, Validators.required ]
    });
  }
}

describe('Email.Component', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule ],
      
    }).compileComponents();
  });

    it('should create', fakeAsync(() => {
      const fixture = createTestingModule( EmailReactTestComponent,
        `<form [formGroup]="form">
          <common-email name='email1' formControlName='email1'></common-email>
         </form>`
      );

      const component = fixture.componentInstance;
      const de = getDebugElement( fixture, 'common-email', 'email1');
      tickAndDetectChanges( fixture );

      expect( de ).toBeTruthy();
      expect( getDebugLabel( de, de.componentInstance.labelforId ) ).toBe( component.defaultLabel );
      expect(de.componentInstance.controlDir.hasError('required')).toBeFalsy();
    
    }));

     it('should be required', fakeAsync(() => {
      const fixture = createTestingModule( EmailReactTestComponent,
        `<form [formGroup]="form">
          <common-email name='email2' formControlName='email2'></common-email>
         </form>`
      );

      const de = getDebugElement( fixture, 'common-email', 'email2');
      tickAndDetectChanges( fixture );
      expect( de ).toBeTruthy();
      expect(de.componentInstance.controlDir.hasError('required')).toBeTruthy();
    }));

     it('should be invalid when format is incorrect', fakeAsync(() => {
      const fixture = createTestingModule( EmailReactTestComponent,
        `<form [formGroup]="form">
          <common-email name='email1' formControlName='email1'></common-email>
         </form>`
      );

      const de = getDebugElement( fixture, 'common-email', 'email1');

      setInput( de, '234is@jest' );
      tickAndDetectChanges( fixture );
      fixture.whenStable().then( () => {
        expect( de ).toBeTruthy();
        expect( de.componentInstance.controlDir.hasError( 'invalidEmail' ) ).toBeTruthy();
      });
    }));

    it('should be valid when format is correct', fakeAsync(() => {
      const fixture = createTestingModule( EmailReactTestComponent,
        `<form [formGroup]="form">
          <common-email name='email1' formControlName='email1'></common-email>
         </form>`
      );

      const de = getDebugElement( fixture, 'common-email', 'email1');
     
      setInput( de, 'test@test.com' );

      tickAndDetectChanges( fixture );
      expect( de ).toBeTruthy();
      expect( de.componentInstance.controlDir.hasError( 'invalidEmail' )   ).toBeFalsy();
    }));

    it('should be invalid where non-printable ascii characters are present', fakeAsync(() => {
      const fixture = createTestingModule( EmailReactTestComponent,
        `<form [formGroup]="form">
          <common-email name='email1' formControlName='email1'></common-email>
         </form>`
      );

      const de = getDebugElement( fixture, 'common-email', 'email1');

      setInput( de, 'testlklsdäô@ksdlkd.com' );
      tickAndDetectChanges( fixture );
      fixture.whenStable().then( () => {
        expect( de.componentInstance.controlDir.hasError( 'invalidChars' ) ).toBeTruthy();
      });
    }));

});

