import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  SampleModalComponent,
  SampleImageInterface,
} from './sample-modal.component';

const IMAGES: SampleImageInterface[] = [
  { path: 'assets/front.png', desc: 'Front of the card', title: 'Front' },
  { path: 'assets/back.png', desc: 'Back of the card' },
];

describe('SampleModalComponent', () => {
  let fixture: ComponentFixture<SampleModalComponent>;
  let component: SampleModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SampleModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SampleModalComponent);
    component = fixture.componentInstance;
    component.title = 'Sample documents';
    component.images = IMAGES;
    fixture.detectChanges();
  });

  function dialog(): HTMLElement {
    return fixture.nativeElement.querySelector('.modal');
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should stay hidden until opened', () => {
    expect(component.isOpen).toBe(false);
    expect(dialog().style.display).toBe('none');
    expect(dialog().getAttribute('aria-hidden')).toBe('true');
  });

  // Before this was fixed, openModal() called .show() on a @ViewChild that
  // never matched anything, so it threw.
  it('should open without throwing', () => {
    expect(() => component.openModal()).not.toThrow();
    fixture.detectChanges();
    expect(component.isOpen).toBe(true);
    expect(dialog().style.display).toBe('block');
    expect(dialog().getAttribute('aria-modal')).toBe('true');
  });

  it('should close again', () => {
    component.openModal();
    fixture.detectChanges();
    component.closeModal();
    fixture.detectChanges();
    expect(component.isOpen).toBe(false);
    expect(dialog().style.display).toBe('none');
  });

  it('should render the title, labelling the dialog with it', () => {
    component.openModal();
    fixture.detectChanges();
    const title: HTMLElement =
      fixture.nativeElement.querySelector('.modal-title');
    expect(title.textContent?.trim()).toBe('Sample documents');
    expect(dialog().getAttribute('aria-labelledby')).toBe(title.id);
  });

  it('should render one image per entry, with its alt text', () => {
    component.openModal();
    fixture.detectChanges();
    const imgs: HTMLImageElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.modal-body img')
    );
    expect(imgs.length).toBe(2);
    expect(imgs[0].getAttribute('src')).toBe('assets/front.png');
    expect(imgs[0].getAttribute('alt')).toBe('Front of the card');
  });

  it('should label only the images that carry a title', () => {
    component.openModal();
    fixture.detectChanges();
    const labels: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.modal-body label')
    );
    expect(labels.length).toBe(1);
    expect(labels[0].textContent?.trim()).toBe('Front');
  });

  it('should close from the header close button, which is keyboard reachable', () => {
    component.openModal();
    fixture.detectChanges();
    const close: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.modal-header button[aria-label="Close"]'
    );
    expect(close).toBeTruthy();
    close.click();
    fixture.detectChanges();
    expect(component.isOpen).toBe(false);
  });

  it('should close from the footer button', () => {
    component.openModal();
    fixture.detectChanges();
    const close: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.modal-footer button'
    );
    close.click();
    fixture.detectChanges();
    expect(component.isOpen).toBe(false);
  });
});
