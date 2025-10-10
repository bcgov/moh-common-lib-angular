import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { Base } from '../../models/base';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';



export enum ApiStatusCodes {
  SUCCESS = '0',
  ERROR = '1',
  WARNING = '2'
}

@Component({
  selector: 'common-confirm-template',
  templateUrl: './confirm-template.component.html',
  styleUrls: ['./confirm-template.component.scss'],
  imports: [CommonModule, FormsModule],
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
