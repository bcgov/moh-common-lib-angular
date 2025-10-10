// TODO: Code refactor
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'common-error-container',
  templateUrl: './error-container.component.html',
  styleUrls: ['./error-container.component.scss'],
  imports: [CommonModule],
})
export class ErrorContainerComponent {

  @Input() displayError = false;

}
