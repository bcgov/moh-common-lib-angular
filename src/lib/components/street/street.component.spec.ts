import { Component, ViewChild } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StreetComponent } from './street.component';
import { setInput } from '../../../helpers/test-helpers';

@Component({
  template: `
    <form>
      <common-street name="street" [(ngModel)]="streetValue"></common-street>
    </form>
  `,
  imports: [FormsModule, StreetComponent],
})
class NgModelHostComponent {
  @ViewChild(StreetComponent) streetComponent!: StreetComponent;
  streetValue = '';
}

@Component({
  template: `
    <form [formGroup]="form">
      <common-street formControlName="street"></common-street>
    </form>
  `,
  imports: [ReactiveFormsModule, StreetComponent],
})
class ReactiveHostComponent {
  @ViewChild(StreetComponent) streetComponent!: StreetComponent;
  form = new FormGroup({ street: new FormControl('') });
}

describe('StreetComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreetComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(StreetComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render an input element', () => {
    const fixture = TestBed.createComponent(StreetComponent);
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
  });

  describe('inside a template-driven form', () => {
    let fixture: ComponentFixture<NgModelHostComponent>;
    let host: NgModelHostComponent;

    // fakeAsync, not async/await: NgForm.addControl (and NgModel's own
    // model-to-view sync) resolve through a shared, module-level
    // Promise.resolve().then(...) inside @angular/forms. Awaiting
    // compileComponents() in a real async beforeEach lets that first
    // registration resolve on the real microtask queue, outside any
    // fakeAsync zone. A later fakeAsync test's tick() cannot flush a
    // microtask chain that was rooted outside its own zone, so the
    // model-to-view update from a second [(ngModel)] change never lands.
    // Keeping setup and assertions inside one fakeAsync zone, with an
    // explicit tick() after the first detectChanges(), avoids that split.
    beforeEach(fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [NgModelHostComponent],
        providers: [provideHttpClient(), provideHttpClientTesting()],
      }).compileComponents();

      fixture = TestBed.createComponent(NgModelHostComponent);
      host = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should show the model value in the input', fakeAsync(() => {
      host.streetValue = '123 Main St';
      fixture.detectChanges();
      // NgModel routes every change after the first registration through
      // _updateValue(), which is itself a Promise.then() callback - it does
      // not write the DOM synchronously. tick() flushes that microtask, then
      // a second detectChanges() renders the now-updated `street` field
      // through the component's [value] binding.
      tick();
      fixture.detectChanges();
      const input: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      expect(input.value).toBe('123 Main St');
    }));

    it('should update the model when the input value changes', () => {
      // The component listens for 'change', not 'input'; setInput fires the
      // same input/change/blur trio a real user interaction produces.
      setInput(
        fixture.debugElement,
        '456 Oak Ave',
        host.streetComponent.labelforId
      );
      fixture.detectChanges();
      expect(host.streetValue).toBe('456 Oak Ave');
    });
  });

  describe('inside a reactive form', () => {
    let fixture: ComponentFixture<ReactiveHostComponent>;
    let host: ReactiveHostComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ReactiveHostComponent],
        providers: [provideHttpClient(), provideHttpClientTesting()],
      }).compileComponents();

      fixture = TestBed.createComponent(ReactiveHostComponent);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should show the patched control value in the input', () => {
      host.form.patchValue({ street: '789 Elm St' });
      fixture.detectChanges();
      const input: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      expect(input.value).toBe('789 Elm St');
    });

    it('should update the control when the input value changes', () => {
      // The component listens for 'change', not 'input'; setInput fires the
      // same input/change/blur trio a real user interaction produces.
      setInput(
        fixture.debugElement,
        '321 Pine Rd',
        host.streetComponent.labelforId
      );
      fixture.detectChanges();
      expect(host.form.get('street')?.value).toBe('321 Pine Rd');
    });

    it('should redraw the input when the control is reset to a value it already holds internally', () => {
      setInput(
        fixture.debugElement,
        '654 Fir St',
        host.streetComponent.labelforId
      );
      fixture.detectChanges();
      expect(host.form.get('street')?.value).toBe('654 Fir St');

      // Programmatic reset to the stale internal value. If the component
      // never records the typed value on its own field, this write looks
      // unchanged to Angular's binding and the DOM keeps showing the
      // earlier, un-cleared text.
      host.form.get('street')!.setValue('');
      fixture.detectChanges();

      const input: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      expect(input.value).toBe('');
    });

    it('emits valueChange once per commit rather than once per keystroke', () => {
      const emissions: string[] = [];
      host.streetComponent.valueChange.subscribe((value) =>
        emissions.push(value)
      );

      const input: HTMLInputElement = fixture.nativeElement.querySelector(
        '#' + host.streetComponent.labelforId
      );
      input.value = 'a';
      input.dispatchEvent(new Event('input'));
      input.value = 'ab';
      input.dispatchEvent(new Event('input'));
      input.value = 'abc';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('change'));

      expect(emissions).toEqual(['abc']);
    });
  });
});
