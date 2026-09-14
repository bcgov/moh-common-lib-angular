import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordComponent } from './password.component';
import { FormsModule, NgForm } from '@angular/forms';

describe('Password.Component', () => {
  let component: PasswordComponent;
  let fixture: ComponentFixture<PasswordComponent>;
  let el: any;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [FormsModule, PasswordComponent],
      providers: [NgForm],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Input label is displayed', async () => {
    component.label = 'Password';
    fixture.detectChanges();
    await fixture.whenStable();
    expect(el.querySelector('label').textContent).toEqual('Password');
  });

  it('Input isRequired set to false (not required)', async () => {
    component.isRequired = false;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(el.querySelector('input').hasAttribute('required')).toBeFalsy();
  });

  it('Input isRequired set to true (required)', async () => {
    component.isRequired = true;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(el.querySelector('input').hasAttribute('required')).toBeTruthy();
  });

  it('Input isDisabled set to true (input is disabled)', async () => {
    component.isDisabled = true;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(el.querySelector('input').hasAttribute('disabled')).toBeTruthy();
  });

  it('Input password appears in input box', async () => {
    component.password = 'BooWhoo@blah1';
    fixture.detectChanges();
    await fixture.whenStable();
    expect(el.querySelector('input').value).toEqual('BooWhoo@blah1');
  });
});
