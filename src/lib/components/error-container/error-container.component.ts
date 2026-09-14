// TODO: Code refactor
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Displays the validation messages projected into it, but only while displayError
 * is set. Every form control in this library renders its errors through one.
 *
 * @example
 *   <common-error-container [displayError]="control.touched && control.invalid">
 *     <div *ngIf="control.errors?.['required']">City is required.</div>
 *   </common-error-container>
 */
@Component({
  selector: 'common-error-container',
  templateUrl: './error-container.component.html',
  styleUrls: ['./error-container.component.scss'],
  imports: [CommonModule],
})
export class ErrorContainerComponent {
  @Input() displayError = false;
}
