// TODO: Code refactor
import {
  Component,
  ViewChild,
  EventEmitter,
  Input,
  Output,
  ElementRef,
} from '@angular/core';

/**
 * The shared button style, so every button across the applications matches and
 * a styling change lands in one place.
 *
 * @example
 *        <common-button label='Remove Spouse'
 *            [buttonType]="buttonClass"
 *            (btnClick)='removeSpouse()'>
 *        </common-button>
 */
@Component({
  selector: 'common-button',
  templateUrl: './button.component.html',
  // viewProviders: [ // TODO: Is this needed?
  //   { provide: ControlContainer, useExisting: forwardRef(() => NgForm ) }
  // ]
})
export class ButtonComponent {
  // Can pass the Style class of a button e.g. For primary, btn btn-primary. Default, btn btn-default. Error, btn btn-danger
  @Input() buttonType: 'default' | 'primary' | 'secondary' = 'default'; // Button style type
  @Input() disabled = false; // Disable button
  @Input() label = 'Button'; // Button label
  @Input() classNames = ''; // Additional classes for customization
  @Output() btnClick: EventEmitter<Event> = new EventEmitter<Event>();
  @ViewChild('button')
  button!: ElementRef;

  // Emit click event to parent component
  onClick($event: Event) {
    this.btnClick.emit($event);
  }
}
