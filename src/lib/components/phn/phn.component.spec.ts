// TODO: code refactor
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, fakeAsync } from '@angular/core/testing';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PhnComponent } from './phn.component';
import { provideNgxMask } from 'ngx-mask';
import { Component, ViewChildren, QueryList, OnInit, Type } from '@angular/core';
import { tickAndDetectChanges, getDebugLabel, getDebugElement } from '../../../helpers/test-helpers';
import { BrowserModule } from '@angular/platform-browser';

function createTestingModule<T>(cmp: Type<T>, template: string): ComponentFixture<PhnReactTestComponent> {

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

  return TestBed.createComponent(cmp) as ComponentFixture<PhnReactTestComponent>;
}

@Component({
  template: ``,
})
class PhnTestComponent {

  @ViewChildren(PhnComponent) phnComponent: QueryList<PhnComponent> | undefined;
  phn1!: string;

  defaultLabel = 'Personal Health Number (PHN)';

  constructor() {}
}

@Component({
  template: ``,
  imports: [
    PhnComponent, FormsModule, ReactiveFormsModule],
})
class PhnReactTestComponent extends PhnTestComponent implements OnInit {

  form!: FormGroup;

  constructor( private fb: FormBuilder ) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group({
      phn1: [ this.phn1 ],
      
    });
  }
}

describe('Phn.Component', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule ],
      providers: [provideNgxMask()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PhnReactTestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  })

  it('should format input correctly with mask', fakeAsync(() => {
    const fixture = TestBed.createComponent(PhnComponent);
    fixture.detectChanges();

    fixture.detectChanges();
    const inputEl = fixture.nativeElement.querySelector('input');

    inputEl.focus();
    inputEl.value = '9999999998';
    inputEl.dispatchEvent(new Event('input'));
    inputEl.dispatchEvent(new Event('change'));
    inputEl.dispatchEvent(new Event('blur'));
        
    expect(inputEl.value).toBe('9999 999 998');

  }));

      it('should be required', fakeAsync(() => {
      const template = `
        <form>
          <common-phn name='phn1' [(ngModel)]='phn1' [required] = "true"></common-phn>
        </form>`;
      const fixture = createTestingModule(PhnReactTestComponent, template);

      tickAndDetectChanges( fixture );

      const de = getDebugElement( fixture, 'common-phn', 'phn1' );
     
      expect( de ).toBeTruthy();
      expect( de.componentInstance.controlDir.hasError( 'required' ) ).toBeTruthy();

    }));

    
      it('should display default label', fakeAsync(() => {
      const template =  `
         <form [formGroup]="form">
          <common-phn name='phn1' formControlName='phn1'></common-phn>
         </form>`;
      const fixture = createTestingModule(PhnReactTestComponent, template);

      tickAndDetectChanges( fixture );

      const de = getDebugElement( fixture, 'common-phn', 'phn1' );
      const label = getDebugLabel( de, de.componentInstance.labelforId );

      expect( de ).toBeTruthy();
      expect( label?.trim() ).toBe( fixture.componentInstance.defaultLabel );

    }));

});

