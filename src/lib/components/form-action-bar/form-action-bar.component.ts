import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { scrollToError } from '../../../helpers/scroll-helpers';

/**
 * A sticky bar at the foot of a page carrying the form's submit button.
 *
 * It must be placed *after* common-page-framework, not inside it.
 *
 * @example
 * <common-form-action-bar
 *     [submitLabel]="buttonLabel"
 *     [canContinue]="canContinue()"
 *     [isLoading]="loading"
 *     (btnClick)="continue()">
 * </common-form-action-bar>
 *
 * @export
 */
@Component({
  selector: 'common-form-action-bar',
  templateUrl: './form-action-bar.component.html',
  styleUrls: ['./form-action-bar.component.scss'],
  imports: [CommonModule],
})
export class FormActionBarComponent {
  @Input() submitLabel: string = 'Continue';
  @Input() canContinue: boolean = true;
  @Input() isLoading: boolean = false;
  @Input() defaultColor: boolean = true;
  @Input() scrollToErrorsOnSubmit: boolean = true;

  @Output() btnClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  onClick($event: MouseEvent) {
    if (!this.isLoading && this.canContinue) {
      this.btnClick.emit($event);

      if (this.scrollToErrorsOnSubmit) {
        // Scroll to error after 50ms, to give the errors time to display.
        // This timeout is outside of Angular change detection.
        setTimeout(scrollToError, 50);
      }
    }
    $event.stopPropagation();
    return false;
  }
}
