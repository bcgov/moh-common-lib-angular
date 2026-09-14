import { Component } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ConsentModalComponent } from './consent-modal.component';

@Component({
  template: `
    <common-consent-modal
      [title]="title"
      [isUnderMaintenance]="isUnderMaintenance"
      [maintenanceMessage]="maintenanceMessage"
      [disableContinue]="disableContinue"
      (accept)="accepted = $event"
      (close)="closed = true">
      <p>Information is collected under section 26 of FOIPPA.</p>
      <a href="#">A focusable link in the projected content</a>
    </common-consent-modal>
  `,
  imports: [ConsentModalComponent],
})
class HostComponent {
  title = 'Information collection notice';
  isUnderMaintenance = false;
  maintenanceMessage = '';
  disableContinue = false;
  accepted: boolean | undefined;
  closed = false;
}

describe('ConsentModalComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let modal: ConsentModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsentModalComponent, HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    modal = fixture.debugElement.children[0].componentInstance;
  });

  function dialog(): HTMLElement {
    return fixture.nativeElement.querySelector('.modal');
  }

  function continueButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.modal-footer button');
  }

  function checkbox(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[type="checkbox"]');
  }

  it('should create', () => {
    expect(modal).toBeTruthy();
  });

  it('should stay hidden until shown', () => {
    expect(modal.isOpen).toBe(false);
    expect(dialog().getAttribute('aria-hidden')).toBe('true');
    expect(dialog().style.display).toBe('none');
  });

  it('should display when show is called', fakeAsync(() => {
    modal.show();
    tick();
    fixture.detectChanges();
    expect(dialog().style.display).toBe('block');
    expect(dialog().getAttribute('aria-modal')).toBe('true');
  }));

  it('should label the dialog with its title', fakeAsync(() => {
    modal.show();
    tick();
    fixture.detectChanges();
    const heading: HTMLElement =
      fixture.nativeElement.querySelector('.modal-header h2');
    expect(heading.textContent?.trim()).toBe('Information collection notice');
    expect(dialog().getAttribute('aria-labelledby')).toBe(heading.id);
  }));

  it('should project the notice body', fakeAsync(() => {
    modal.show();
    tick();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.modal-body p').textContent
    ).toContain('section 26 of FOIPPA');
  }));

  it('should disable continue until the agree box is checked', fakeAsync(() => {
    modal.show();
    tick();
    fixture.detectChanges();
    expect(continueButton().disabled).toBe(true);

    checkbox().click();
    fixture.detectChanges();
    expect(continueButton().disabled).toBe(false);
  }));

  it('should keep continue disabled while disableContinue is set', fakeAsync(() => {
    host.disableContinue = true;
    modal.show();
    tick();
    fixture.detectChanges();
    checkbox().click();
    fixture.detectChanges();
    expect(continueButton().disabled).toBe(true);
  }));

  it('should emit accept and close, and hide, on continue', fakeAsync(() => {
    modal.show();
    tick();
    fixture.detectChanges();
    checkbox().click();
    fixture.detectChanges();

    continueButton().click();
    fixture.detectChanges();

    expect(host.accepted).toBe(true);
    expect(host.closed).toBe(true);
    expect(modal.isOpen).toBe(false);
  }));

  it('should reset the agree box each time it opens', fakeAsync(() => {
    modal.show();
    tick();
    fixture.detectChanges();
    checkbox().click();
    fixture.detectChanges();
    modal.continue();

    modal.show();
    tick();
    fixture.detectChanges();
    expect(modal.agreeCheck).toBe(false);
    expect(continueButton().disabled).toBe(true);
  }));

  describe('maintenance', () => {
    it('should show the maintenance message instead of the notice', fakeAsync(() => {
      host.isUnderMaintenance = true;
      host.maintenanceMessage = 'Back at 9am.';
      modal.show();
      tick();
      fixture.detectChanges();

      expect(
        fixture.nativeElement.querySelector('.modal-header h2').textContent
      ).toContain('Maintenance notice');
      expect(
        fixture.nativeElement.querySelector('.modal-body h4').textContent
      ).toContain('Back at 9am.');
    }));

    it('should offer no way to continue while under maintenance', fakeAsync(() => {
      host.isUnderMaintenance = true;
      modal.show();
      tick();
      fixture.detectChanges();
      expect(continueButton()).toBeNull();
      expect(checkbox()).toBeNull();
    }));
  });

  describe('focus handling', () => {
    it('should swallow Escape, since consent cannot be dismissed', fakeAsync(() => {
      modal.show();
      tick();
      fixture.detectChanges();

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        cancelable: true,
      });
      window.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
      expect(modal.isOpen).toBe(true);
    }));

    it('should ignore keys while closed', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        cancelable: true,
      });
      window.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });

    it('should keep Tab inside the dialog', fakeAsync(() => {
      modal.show();
      tick();
      fixture.detectChanges();

      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        cancelable: true,
      });
      window.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
      expect(fixture.nativeElement.contains(document.activeElement)).toBe(true);
    }));

    it('should wrap backwards from the first element to the last', fakeAsync(() => {
      modal.show();
      tick();
      fixture.detectChanges();

      // The continue button is disabled until the box is checked, and a
      // disabled control is skipped, so it is not the wrap target yet.
      const items: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll<HTMLElement>(
          'a[href], input, button'
        )
      ).filter((el) => !el.hasAttribute('disabled'));
      items[0].focus();
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Tab',
          shiftKey: true,
          cancelable: true,
        })
      );

      expect(document.activeElement).toBe(items[items.length - 1]);
    }));

    it('should bring the disabled continue button into the tab order once enabled', fakeAsync(() => {
      modal.show();
      tick();
      fixture.detectChanges();
      checkbox().click();
      fixture.detectChanges();

      const items: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll<HTMLElement>(
          'a[href], input, button'
        )
      ).filter((el) => !el.hasAttribute('disabled'));

      expect(items).toContain(continueButton());
    }));
  });
});
