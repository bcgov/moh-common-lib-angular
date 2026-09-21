import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideNgxMask } from 'ngx-mask';
import { PhnComponent } from './phn.component';
import type { ErrorMessage } from '../../models/error-message.interface';

@Component({
  template: `
    <common-phn [errorMessage]="customMsg" [disabled]="true"></common-phn>
  `,
  imports: [PhnComponent],
})
class PlainHostComponent {
  customMsg: ErrorMessage = { required: 'PHN is required for this applicant.' };
}

@Component({
  template: `
    <common-phn
      [(ngModel)]="phn"
      name="phn"
      [errorMessage]="customMsg"
      [disabled]="true"></common-phn>
  `,
  imports: [PhnComponent, FormsModule],
})
class NgModelHostComponent {
  phn = '';
  customMsg: ErrorMessage = { required: 'PHN is required for this applicant.' };
}

function build<T>(cmp: new () => T) {
  TestBed.configureTestingModule({
    imports: [cmp as never],
    providers: [provideNgxMask()],
  });
  const fixture = TestBed.createComponent(cmp);
  fixture.detectChanges();
  return fixture;
}

describe('AbstractFormControl inherited inputs on a subclass', () => {
  it('binds [errorMessage] and [disabled] with no form directive attached', () => {
    const fixture = build(PlainHostComponent);
    const phn = fixture.debugElement.children[0]
      .componentInstance as PhnComponent;
    expect(phn.errorMessage).toEqual({
      required: 'PHN is required for this applicant.',
    });
    expect(phn.disabled).toBe(true);
  });

  it('binds [errorMessage] alongside ngModel', () => {
    const fixture = build(NgModelHostComponent);
    const phn = fixture.debugElement.children[0]
      .componentInstance as PhnComponent;
    expect(phn.errorMessage).toEqual({
      required: 'PHN is required for this applicant.',
    });
  });
});
