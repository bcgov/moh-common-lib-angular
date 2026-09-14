import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThumbnailComponent } from './thumbnail.component';
import { CommonImage } from '../../models/images.model';

function imageOf(naturalWidth: number, naturalHeight: number): CommonImage {
  const image = new CommonImage('data:image/jpeg;base64,AAAA');
  image.naturalWidth = naturalWidth;
  image.naturalHeight = naturalHeight;
  image.name = 'passport.jpg';
  return image;
}

describe('ThumbnailComponent', () => {
  let fixture: ComponentFixture<ThumbnailComponent>;
  let component: ThumbnailComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThumbnailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ThumbnailComponent);
    component = fixture.componentInstance;
  });

  function init(image: CommonImage) {
    component.imageObject = image;
    fixture.detectChanges();
  }

  it('should create', () => {
    init(imageOf(400, 300));
    expect(component).toBeTruthy();
  });

  describe('scaledWidth', () => {
    it('should scale to a height of 180 for a landscape image', () => {
      // 180 * 200 / 300 = 120
      init(imageOf(200, 300));
      expect(component.scaledWidth).toBe(120);
    });

    it('should cap at 250 for a wide image', () => {
      init(imageOf(4000, 300));
      expect(component.scaledWidth).toBe(250);
    });

    it('should fall back to 100 when the scaled width is under 30', () => {
      // 180 * 10 / 1000 = 2
      init(imageOf(10, 1000));
      expect(component.scaledWidth).toBe(100);
    });

    it('should fall back to 300 when the dimensions are not numbers', () => {
      init(imageOf(NaN, NaN));
      expect(component.scaledWidth).toBe(300);
    });

    it('should fall back to 300 when the height is zero', () => {
      // 180 * 200 / 0 is Infinity, which parseInt cannot read.
      init(imageOf(200, 0));
      expect(component.scaledWidth).toBe(300);
    });
  });

  it('should emit the image when remove is clicked', () => {
    const image = imageOf(400, 300);
    init(image);
    let emitted: CommonImage | undefined;
    component.deleteImage.subscribe((i) => (emitted = i));
    const remove: HTMLAnchorElement =
      fixture.nativeElement.querySelector('.action-strip a');
    remove.click();
    expect(emitted).toBe(image);
  });

  it('should hide the remove action in review mode', () => {
    component.reviewMode = true;
    init(imageOf(400, 300));
    expect(fixture.nativeElement.querySelector('.action-strip')).toBeNull();
  });

  it('should keep the full size view closed until the image is clicked', () => {
    init(imageOf(400, 300));
    expect(component.isFullSizeViewOpen).toBe(false);
    const modal: HTMLElement = fixture.nativeElement.querySelector('.modal');
    expect(modal.getAttribute('aria-hidden')).toBe('true');
  });

  it('should open the full size view when the thumbnail is clicked', () => {
    init(imageOf(400, 300));
    const img: HTMLImageElement = fixture.nativeElement.querySelector(
      '.thumbnail-container img'
    );
    img.click();
    fixture.detectChanges();
    expect(component.isFullSizeViewOpen).toBe(true);
    const modal: HTMLElement = fixture.nativeElement.querySelector('.modal');
    expect(modal.getAttribute('aria-modal')).toBe('true');
    expect(modal.style.display).toBe('block');
  });

  it('should open the full size view from the keyboard', () => {
    init(imageOf(400, 300));
    const img: HTMLImageElement = fixture.nativeElement.querySelector(
      '.thumbnail-container img'
    );
    img.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(component.isFullSizeViewOpen).toBe(true);
  });

  it('should open the full size view on Space as well as Enter', () => {
    init(imageOf(400, 300));
    component.handleKeyDown(new KeyboardEvent('keydown', { key: ' ' }));
    expect(component.isFullSizeViewOpen).toBe(true);
  });

  it('should ignore other keys', () => {
    init(imageOf(400, 300));
    component.handleKeyDown(new KeyboardEvent('keydown', { key: 'a' }));
    expect(component.isFullSizeViewOpen).toBe(false);
  });

  it('should describe the thumbnail with the image name for screen readers', () => {
    init(imageOf(400, 300));
    const img: HTMLImageElement = fixture.nativeElement.querySelector(
      '.thumbnail-container img'
    );
    expect(img.getAttribute('alt')).toBe('passport.jpg');
  });

  it('should close the full size view from the close button', () => {
    init(imageOf(400, 300));
    component.showFullSizeView();
    fixture.detectChanges();
    const close: HTMLButtonElement =
      fixture.nativeElement.querySelector('.modal .close');
    close.click();
    fixture.detectChanges();
    expect(component.isFullSizeViewOpen).toBe(false);
  });

  it('should title the full size view with the image name', () => {
    init(imageOf(400, 300));
    const title: HTMLElement =
      fixture.nativeElement.querySelector('.modal-title');
    expect(title.textContent?.trim()).toBe('passport.jpg');
  });
});
