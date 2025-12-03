import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
/**
 * AccordionComponent is a
 *
 * @example
 *       	<common-accordion
 *          title="'Documents'"
 *          [isOpen]="false">
  *       </common-accordion>
 * @export
 */

@Component({
  selector: 'common-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AccordionCommonComponent  {

  @Input() title: string = '';
  @Input() isOpen: boolean = false;

  public expandText: string =  '(click to expand)';

  constructor() { }


}
