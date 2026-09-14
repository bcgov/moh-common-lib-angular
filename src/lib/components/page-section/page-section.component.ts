import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * A section within a page, laying content out beside an optional aside.
 *
 * @example
 * <common-page-section layout="tips">
 *        <p>This will go in the main column</p>
 *        <aside>This will go in the side column</aside>
 * </common-page-section>
 *
 * @export
 */
@Component({
  selector: 'common-page-section',
  templateUrl: './page-section.component.html',
  styleUrls: ['./page-section.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule],
})
export class PageSectionComponent {
  @Input() layout: 'double' | 'tips' | 'noTips' = 'tips';
}
