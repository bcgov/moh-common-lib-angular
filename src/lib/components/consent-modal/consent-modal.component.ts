import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Base } from '../../models/base';

/**
 * An information collection notice shown at the start of an application, gated
 * on an agree checkbox. Project the notice body as content.
 *
 * @example
 *   <common-consent-modal #consent title="Information collection notice"
 *                         (accept)="onAccept($event)">
 *     <p>Information is collected under section 26 of FOIPPA.</p>
 *   </common-consent-modal>
 *
 *   Open it from the host: @ViewChild('consent') consent!: ConsentModalComponent;
 *   then this.consent.show();
 */
@Component({
  selector: 'common-consent-modal',
  templateUrl: './consent-modal.component.html',
  imports: [CommonModule, FormsModule],
})
export class ConsentModalComponent extends Base {
  @Input() title = '';
  @Input() agreeLabel = 'I have read and understand this info';
  @Input() continueButton = 'Continue';

  /**
   * For a form control inside the projected content that must be satisfied
   * before the user can continue.
   */
  @Input() disableContinue = false;

  /**
   * Set by the application. The legacy component called the SPA ENV server
   * itself; that is application concern, not a shared library one, so the app
   * makes the call and passes the result in.
   */
  @Input() isUnderMaintenance = false;
  @Input() maintenanceMessage = '';

  @Output() accept = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  @ViewChild('modalContents') modalContents!: ElementRef<HTMLElement>;

  isOpen = false;
  agreeCheck = false;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private static readonly FOCUSABLE =
    'a[href], input:not([disabled]), select:not([disabled]), ' +
    'textarea:not([disabled]), button:not([disabled]), [tabindex="0"]';

  /** Displays the modal. */
  show() {
    this.isOpen = true;
    this.agreeCheck = false;
    // Hosts commonly open the modal from ngOnInit or ngAfterViewInit, which run
    // after this component's own bindings were checked. Settling the view here
    // keeps [style.display] consistent before Angular verifies it, instead of
    // raising NG0100 in development builds.
    this.changeDetectorRef.detectChanges();
    // Focus the first control once the dialog has rendered.
    setTimeout(() => this.focusable()[0]?.focus());
  }

  /**
   * Legacy name for show(). Kept as a thin alias so callers written against
   * moh-common-lib 3.6.2 keep working unchanged.
   */
  showFullSizeView() {
    this.show();
  }

  hide() {
    this.isOpen = false;
  }

  continue() {
    this.accept.emit(true);
    this.hide();
    this.close.emit();
  }

  isContinueDisabled(): boolean {
    return !this.agreeCheck || this.disableContinue;
  }

  /**
   * Keeps focus inside the dialog, and swallows Escape. Consent is the one
   * modal a user is not allowed to dismiss without answering.
   */
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.isOpen) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }

    const items = this.focusable();
    if (items.length === 0) {
      return;
    }
    event.preventDefault();
    const current = items.indexOf(document.activeElement as HTMLElement);
    const step = event.shiftKey ? -1 : 1;
    const next = (current + step + items.length) % items.length;
    items[next].focus();
  }

  private focusable(): HTMLElement[] {
    if (!this.modalContents) {
      return [];
    }
    return Array.from(
      this.modalContents.nativeElement.querySelectorAll<HTMLElement>(
        ConsentModalComponent.FOCUSABLE
      )
    ).filter((el) => !el.hasAttribute('disabled'));
  }
}
