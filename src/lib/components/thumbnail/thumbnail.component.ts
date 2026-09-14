import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonImage } from '../../models/images.model';

/**
 * A single uploaded image, with a click-to-enlarge view and a remove action.
 *
 * @example
 * <common-thumbnail [imageObject]="image" (deleteImage)="remove($event)">
 * </common-thumbnail>
 *
 * @export
 */
// The thumbnail's styles live in file-uploader.component.scss, which is
// ViewEncapsulation.None, so they are in place before the first thumbnail
// renders. That is the legacy arrangement and moving them would break it.
@Component({
  selector: 'common-thumbnail',
  templateUrl: './thumbnail.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule],
})
export class ThumbnailComponent implements OnInit {
  @Input() imageObject!: CommonImage;
  @Input() reviewMode: boolean = false;
  @Output() deleteImage: EventEmitter<CommonImage> =
    new EventEmitter<CommonImage>();

  scaledWidth: number = 300;

  /**
   * Drives the full size view. The legacy component used ngx-bootstrap's
   * ModalDirective; this library has no such dependency, so the dialog is
   * plain markup toggled from here.
   */
  isFullSizeViewOpen = false;

  ngOnInit() {
    const scaledWidthString: string = (
      (180 * this.imageObject.naturalWidth) /
      this.imageObject.naturalHeight
    ).toFixed(0);
    this.scaledWidth = parseInt(scaledWidthString, 10);

    if (this.scaledWidth > 250) {
      this.scaledWidth = 250;
    } else if (this.scaledWidth < 30) {
      this.scaledWidth = 100;
    }

    if (isNaN(this.scaledWidth)) {
      this.scaledWidth = 300;
    }
  }

  delete(_evt?: any) {
    this.deleteImage.emit(this.imageObject);
  }

  /** Keyboard equivalent of clicking the thumbnail. */
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.showFullSizeView();
    }
  }

  showFullSizeView() {
    this.isFullSizeViewOpen = true;
  }

  hideFullSizeView() {
    this.isFullSizeViewOpen = false;
  }
}
