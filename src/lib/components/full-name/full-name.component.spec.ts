import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Component } from '@angular/core';
import { FullNameComponent } from './full-name.component';
import { Person } from '../../models/person.model';

@Component({
  template: `
    <form [formGroup]="form">
      <common-full-name
        formControlName="person"
        [required]="required"></common-full-name>
    </form>
  `,
  imports: [FullNameComponent, ReactiveFormsModule],
})
class ReactiveHostComponent {
  required = true;
  form = new FormGroup({ person: new FormControl(new Person()) });
}

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

  describe('required validation on the host control', () => {
    const settle = (fixture: ComponentFixture<unknown>) => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
    };

    const lastNameInput = (
      fixture: ComponentFixture<ReactiveHostComponent>
    ): HTMLInputElement => {
      const inputs: HTMLInputElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('input')
      );
      return inputs[inputs.length - 1];
    };

    const control = (fixture: ComponentFixture<ReactiveHostComponent>) =>
      fixture.componentInstance.form.get('person') as FormControl;

    it('should report a blank last name, which a truthy Person hides from RequiredValidator', fakeAsync(() => {
      const fixture = TestBed.createComponent(ReactiveHostComponent);
      settle(fixture);

      expect(control(fixture).errors).toEqual({ required: true });
    }));

    it('should clear the error and turn dirty once a last name is entered', fakeAsync(() => {
      const fixture = TestBed.createComponent(ReactiveHostComponent);
      settle(fixture);

      const input = lastNameInput(fixture);
      input.value = 'Smith';
      input.dispatchEvent(new Event('change'));
      settle(fixture);

      expect(control(fixture).errors).toBeNull();
      expect(control(fixture).dirty).toBe(true);
      expect((control(fixture).value as Person).lastName).toBe('Smith');
    }));

    it('should treat whitespace as blank', fakeAsync(() => {
      const fixture = TestBed.createComponent(ReactiveHostComponent);
      settle(fixture);

      const input = lastNameInput(fixture);
      input.value = '   ';
      input.dispatchEvent(new Event('change'));
      settle(fixture);

      expect(control(fixture).errors).toEqual({ required: true });
    }));

    it('should accept a blank last name when required is false', fakeAsync(() => {
      const fixture = TestBed.createComponent(ReactiveHostComponent);
      fixture.componentInstance.required = false;
      settle(fixture);

      expect(control(fixture).errors).toBeNull();
    }));
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
