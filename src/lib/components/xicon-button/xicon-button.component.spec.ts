import { Component } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { XiconButtonComponent } from './xicon-button.component';
import { MoHCommonLibraryError } from '../../../helpers/library-error';

@Component({
  template: `
    <common-xicon-button
      [label]="label"
      (clickEvent)="onClickEvent()"></common-xicon-button>
  `,
  imports: [XiconButtonComponent],
})
class HostComponent {
  label = 'Remove Spouse';
  clickEventCount = 0;

  onClickEvent() {
    this.clickEventCount++;
  }
}

@Component({
  template: `
    <common-xicon-button></common-xicon-button>
  `,
  imports: [XiconButtonComponent],
})
class NoLabelHostComponent {}

@Component({
  template: `
    <common-xicon-button
      [label]="label"
      (click)="onNativeClick()"></common-xicon-button>
  `,
  imports: [XiconButtonComponent],
})
class NativeClickHostComponent {
  label = 'Remove Spouse';
  nativeClickCount = 0;

  onNativeClick() {
    this.nativeClickCount++;
  }
}

describe('XiconButtonComponent', () => {
  it('should create', () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the button with title and aria-label both set from [label]', () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');

    expect(button.getAttribute('title')).toBe('Remove Spouse');
    expect(button.getAttribute('aria-label')).toBe('Remove Spouse');
  });

  // The legacy moh-common-lib spec never asserted this: label is the
  // component's only accessibility contract, and ngOnInit throws
  // MoHCommonLibraryError (not a generic Error) when it is missing.
  it('throws MoHCommonLibraryError when label is missing', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [NoLabelHostComponent],
    }).compileComponents();

    expect(() => {
      const fixture = TestBed.createComponent(NoLabelHostComponent);
      tick();
      fixture.detectChanges();
    }).toThrow(MoHCommonLibraryError);
  }));

  it('emits clickEvent exactly once when the inner button is clicked', () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.clickEventCount).toBe(1);
  });

  // XiconButtonComponent declares no "click" output (see the class-level
  // comment in xicon-button.component.ts), so (click) at a call site binds to
  // the host element as a native DOM listener instead of a component output.
  // The inner <button>'s click bubbles through the DOM to that host element,
  // so a native click handler on <common-xicon-button> still fires - exactly
  // once, not zero and not twice. Proven manually in a browser; this encodes
  // that observed behaviour as a regression test.
  it('still fires a native (click) bound on the host element exactly once', () => {
    TestBed.configureTestingModule({
      imports: [NativeClickHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(NativeClickHostComponent);
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.nativeClickCount).toBe(1);
  });
});
