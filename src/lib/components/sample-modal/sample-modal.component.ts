//TODO: Refactor
import { Component, Input } from '@angular/core';
import { Base } from '../../models/base';
import { CommonModule } from '@angular/common';

export interface SampleImageInterface {
  path: string;
  desc: string;
  title?: string;
}

/**
 * A modal showing sample images, used to illustrate what a document should look
 * like before someone uploads one.
 *
 * @example
 *   <common-sample-modal #samples title="Sample documents" [images]="samples">
 *   </common-sample-modal>
 *
 *   It opens from the host, not from a binding:
 *   @ViewChild('samples') samples!: SampleModalComponent;
 *   this.samples.openModal();
 */
@Component({
  selector: 'common-sample-modal',
  templateUrl: './sample-modal.component.html',
  styleUrls: ['./sample-modal.component.scss'],
  imports: [CommonModule],
})
export class SampleModalComponent extends Base {
  @Input() title!: string;
  @Input() images: SampleImageInterface[] = [];

  /**
   * Drives the dialog. The ngx-bootstrap ModalDirective this used to delegate
   * to is not a dependency of this library, and the @ViewChild that looked for
   * it never matched anything, so openModal threw.
   */
  isOpen = false;

  public openModal(): void {
    this.isOpen = true;
  }

  public closeModal(): void {
    this.isOpen = false;
  }
}
