import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MoHCommonLibraryError } from '../../../helpers/library-error';

/**
 * A small "x" close/remove button, styled as a danger-colored circled cross.
 *
 * Emits clickEvent rather than the native "click" output: a component that
 * declared its own "click" would shadow the DOM event, which
 * @angular-eslint/no-output-native rejects. With no "click" output on the
 * component, a (click) binding at a call site attaches to the host element as
 * a native listener instead, and the inner button's click still reaches it by
 * bubbling through the DOM.
 *
 * @example
 *   <common-xicon-button label="Remove Spouse" (clickEvent)="removeSpouse()">
 *   </common-xicon-button>
 */
@Component({
  selector: 'common-xicon-button',
  templateUrl: './xicon-button.component.html',
  styleUrls: ['./xicon-button.component.scss'],
})
export class XiconButtonComponent implements OnInit {
  /**
   * Label to use for accessibility.
   * @required
   */
  @Input() label!: string;

  @Output() clickEvent: EventEmitter<void> = new EventEmitter<void>();

  ngOnInit() {
    if (!this.label) {
      const msg = `common-xicon-button initialized without label. You MUST supply a label attribute for accessibility.
      e.g. <common-xicon-button label='Remove Spouse'>
`; // Intentional to create a blank line between our error and stack trace.
      throw new MoHCommonLibraryError(msg);
    }
  }

  onBtnClick() {
    this.clickEvent.emit();
  }
}
