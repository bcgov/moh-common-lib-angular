import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
/**
 * A collapsible panel with a heading that toggles its projected content.
 *
 * @example
 *       	<common-accordion
 *          title="'Documents'"
 *          [isOpen]="false">
 *       </common-accordion>
 */

@Component({
  selector: 'common-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AccordionCommonComponent {
  @Input() title: string = '';
  @Input() isOpen: boolean = false;

  public expandText: string = '(click to expand)';

  constructor() {}
}
