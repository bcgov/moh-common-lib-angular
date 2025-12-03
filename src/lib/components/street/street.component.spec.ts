// import { StreetComponent } from './street.component';
// import { ErrorContainerComponent } from '../error-container/error-container.component';
// import { Component, ViewChildren, QueryList, OnInit, Type } from '@angular/core';
// import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { ComponentFixture, ComponentFixtureAutoDetect, fakeAsync, TestBed } from '@angular/core/testing';
// import { tickAndDetectChanges, getDebugElement, getDebugLabel } from '../../../helpers/test-helpers';
// import { GeoAddressResult } from '../../services/geocoder.service';
// import { BrowserModule } from '@angular/platform-browser';

// /**
//  * Creates a testing module for the specified component.
//  * @param cmp The component to create a testing module for.
//  * @param template The HTML template to use for the component.
//  * @returns A ComponentFixture for the component.
//  */
// function createTestingModule<T>(
//   cmp: Type<T>,
//   template: string
// ): ComponentFixture<T> {
//   const importComp: any = [BrowserModule, FormsModule, ReactiveFormsModule, ErrorContainerComponent];

//   // Configure the testing module.  Removed declarations as they are not needed here and can cause issues.
//   TestBed.configureTestingModule({
//     imports: [importComp],
//     providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }],
//   }).overrideComponent(cmp, {
//     set: {
//       template: template,
//     },
//   });

//   // Compile the components.  Moved this outside of the configureTestingModule block.
//   TestBed.compileComponents();

//   return TestBed.createComponent(cmp) as ComponentFixture<T>;
// }

// @Component({
//   template: ``
// })
// class StreetTestComponent {
//   @ViewChildren(StreetComponent) streetComponent!: QueryList<StreetComponent>;

//   street1!: string;
//   street2!: string;
//   street3!: string;

//   defaultLabel: string = 'Full street address or rural route';

//     geoResult!: GeoAddressResult;
// }

// class StreetReactTestComponent extends StreetTestComponent implements OnInit {

//   form!: FormGroup;

//   constructor( private fb: FormBuilder ) {
//     super();
//   }

//   ngOnInit() {
//     // Initialize the form group with form controls.  Added Validators.required for demonstration.
//     this.form = this.fb.group({
//       street1: [ this.street1 ],
//       street2: [ this.street2 ],
//       street3: [ this.street3 ]
//     });
//   }

//   onSelect($event: GeoAddressResult) {
//     this.geoResult = $event;
//   }

// }

// describe('Street.Component', () => {

//   describe('Custom controls - Reactive', () => {

//     it('should create', fakeAsync(() => {
//       // Create the component fixture.
//       const fixture = createTestingModule( StreetReactTestComponent,
//         `<form [formGroup]="form">
//           <common-street name='street1' formControlName='street1'></common-street>
//          </form>`
//       );

//       const component = fixture.componentInstance;
//       // Trigger change detection.
//       tickAndDetectChanges( fixture );

//       // Get the debug element for the street component.
//       const de = getDebugElement( fixture, 'common-street', 'street1');
//       // Get the label for the street component.
//       const label = getDebugLabel( de, de.componentInstance.labelforId );

//       // Assert that the street component exists.
//       expect( component.streetComponent ).toBeTruthy();
//       // Assert that the label is correct.
//       expect( label ).toBe( component.defaultLabel );
//       // Assert that the form control is not required.
//       expect( component.form.get('street1')?.hasError( 'required' ) ).toBeFalsy();
//     }));

// /* TODO: Figure out how to test GeoCoder
//     xit('should use GeoCoder', fakeAsync(() => {
//       const fixture = createTestingModule( StreetReactTestComponent,
//         `<form [formGroup]="form">
//           <common-street name='street3' formControlName='street3'
//                          [useGeoCoder]='true'
//                          (select)="onSelect($event)"></common-street>
//          </form>`,
//          directives,
//          true,
//          importDirectives,
//          //[GeocoderService]
//       );

//       const component = fixture.componentInstance;
//       const el = getInputElement( fixture, 'common-street', 'street3');
//       el.value = '716 ';
//       el.dispatchEvent( new KeyboardEvent('keyup', { key: 'Y', } ));
//       el.dispatchEvent( new Event( 'input' ) );

//       tickAndDetectChanges( fixture );
//       fixture.whenStable().then( () => {


//         console.log( 'geocoder result: ', component.geoResult,
//         component.form.get('street3').value );
//       });
//     }));
//     */

//   });

// });