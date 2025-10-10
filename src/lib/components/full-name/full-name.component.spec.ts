import { FormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { FullNameComponent } from './full-name.component';

describe('Full-name.Component', () => {
    
  beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [FullNameComponent, FormsModule],
      }).compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(FullNameComponent);
        const cmpInstance = fixture.componentInstance;
        expect(cmpInstance).toBeTruthy();
    });
});



// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { FormsModule, NgForm } from '@angular/forms';
// import { FullNameComponent } from './full-name.component';
// import { Person } from '../../models/person.model';

// describe('NameComponent', () => {
//   let component: FullNameComponent;
//   let fixture: ComponentFixture<FullNameComponent>;
//   let element: HTMLElement;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       declarations: [FullNameComponent],
//       imports: [FormsModule],
//       providers: [NgForm, Person],
//     }).compileComponents();
//   });

//   beforeEach(() => {
//     //const person = new Person;
//     fixture = TestBed.createComponent(FullNameComponent);
//     component = fixture.componentInstance;
//     element = fixture.nativeElement;
//     fixture.detectChanges();
//   });

//     it('should create', () => {
//       expect(component).toBeTruthy();
//     });

//   //   it ('FirstName label is displayed', () => {
//   //     component.firstNamelabel = 'First Name';
//   //     fixture.detectChanges();
//   //     fixture.whenStable().then(() => {
//   //       expect(element.querySelector('firstNamelabel')?.textContent).toEqual('First Name');
//   //     });
//   //   });

//   //   // it ('LastName label is displayed', () => {
//   //   //   component.lastNamelabel = 'Last Name';
//   //   //   fixture.detectChanges();
//   //   //   fixture.whenStable().then(() => {
//   //   //     expect(el.querySelector('lastNamelabel').textContent).toEqual('Last Name');
//   //   //   });
//   //   // });

//   //   // it ('First Name value Input by the User', () => {
//   //   //   component.firstName = 'Mark';

//   //   //   fixture.detectChanges();
//   //   //   fixture.whenStable().then(() => {
//   //   //     expect(el.querySelector('input[type=text]').value).toEqual('Mark');
//   //   //   });
//   //   // });
// });

// // describe('NameComponent', () => {
// //   let component: FullNameComponent;
// //   let fixture: ComponentFixture<FullNameComponent>;
// //   let element : HTMLElement;

// //   beforeEach(async() => {
// //     TestBed.configureTestingModule({
// //       declarations: [ FullNameComponent ],
// //       imports: [ FormsModule ],
// //       providers: [ NgForm, Person ]
// //     })
// //     .compileComponents();
// //   });

// //   beforeEach(() => {
// //    //const person = new Person;
// //     fixture = TestBed.createComponent(FullNameComponent);
// //     component = fixture.componentInstance;
// //     element = fixture.nativeElement;
// //     fixture.detectChanges();
// //   });

// //   it('should create', () => {
// //     expect(component).toBeTruthy();
// //   });

// //   it ('FirstName label is displayed', () => {
// //     component.firstNamelabel = 'First Name';
// //     fixture.detectChanges();
// //     fixture.whenStable().then(() => {
// //       expect(element.querySelector('firstNamelabel')?.textContent).toEqual('First Name');
// //     });
// //   });

// //   // it ('LastName label is displayed', () => {
// //   //   component.lastNamelabel = 'Last Name';
// //   //   fixture.detectChanges();
// //   //   fixture.whenStable().then(() => {
// //   //     expect(el.querySelector('lastNamelabel').textContent).toEqual('Last Name');
// //   //   });
// //   // });

// //   // it ('First Name value Input by the User', () => {
// //   //   component.firstName = 'Mark';

// //   //   fixture.detectChanges();
// //   //   fixture.whenStable().then(() => {
// //   //     expect(el.querySelector('input[type=text]').value).toEqual('Mark');
// //   //   });
// //   // });
// // });
