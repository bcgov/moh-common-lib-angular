// TODO: Code refactor
import { Component, ViewChild, EventEmitter, Input, Output, ElementRef } from '@angular/core';

/**
 * Button Component is a button which can be used across the application to have
 * same button style.
 *
 * You're free to create custom (bootstrap) buttons as your application
 * requires. The main advantages to this component are:
 *
 *  - consistency
 *  - simplicity (less markup)
 *  - making future changes easier, such as automatically updating any changes
 * to button colour stylings.
 *
 *
 * @example
 *        <common-button label='Remove Spouse'
 *            [buttonType]="buttonClass"
 *            (btnClick)='removeSpouse()'>
 *        </common-button>
 * @export
 */
@Component({
  selector: 'common-button',
  templateUrl: './button.component.html',
  // viewProviders: [ // TODO: Is this needed?
  //   { provide: ControlContainer, useExisting: forwardRef(() => NgForm ) }
  // ]
})

export class ButtonComponent  {

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
