import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { Base } from '../../models/base';
import { CommonModule } from '@angular/common';

export enum ApiStatusCodes {
  SUCCESS = '0',
  ERROR = '1',
  WARNING = '2',
}

/**
 * A confirmation panel whose icon and styling follow the ApiStatusCodes value it
 * is given: success, warning or error.
 *
 * @example
 *   <common-confirm-template [displayIcon]="status">
 *     <h2 confirmationTitle>Your application was received</h2>
 *     <p>Reference number 12345.</p>
 *     <div AdditionalInfo>Keep this number for your records.</div>
 *   </common-confirm-template>
 */
@Component({
  selector: 'common-confirm-template',
  templateUrl: './confirm-template.component.html',
  styleUrls: ['./confirm-template.component.scss'],
  imports: [CommonModule],
  schemas: [NO_ERRORS_SCHEMA],
})
export class ConfirmTemplateComponent extends Base {
  @Input() displayIcon: ApiStatusCodes = ApiStatusCodes.SUCCESS;

  constructor() {
    super();
  }

  // Status codes
  get successCode() {
    return ApiStatusCodes.SUCCESS;
  }

  get errorCode() {
    return ApiStatusCodes.ERROR;
  }

  get warningCode() {
    return ApiStatusCodes.WARNING;
  }
}
