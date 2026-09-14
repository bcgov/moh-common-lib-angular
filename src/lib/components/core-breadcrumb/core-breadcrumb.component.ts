import { Component } from '@angular/core';

/**
 * A breadcrumb bar with three optional slots. Select one by putting left,
 * center or right as an attribute on the element you project.
 *
 * @example
 *   <common-core-breadcrumb>
 *    <div left>
 *      <a routerLink="/provisioner/">Dashboard</a> /
 *      <strong>Provision by User</strong>
 *    </div>
 *    <div center></div>
 *    <div right></div>
 *   </common-core-breadcrumb>
 */
@Component({
  selector: 'common-core-breadcrumb',
  templateUrl: './core-breadcrumb.component.html',
  styleUrls: ['./core-breadcrumb.component.scss'],
})
export class CoreBreadcrumbComponent {}
