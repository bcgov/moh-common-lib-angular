import { TestBed } from '@angular/core/testing';
import { AccordionCommonComponent } from './accordion.component';

describe('Accordion.Component', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionCommonComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AccordionCommonComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('Accordion Title is displayed', () => {
    const fixture = TestBed.createComponent(AccordionCommonComponent);
    fixture.componentInstance.title = 'Show Documents';
    fixture.detectChanges();
    const heading: HTMLElement = fixture.nativeElement.querySelector(
      '[accordion-heading]'
    );
    expect(heading.textContent).toContain('Show Documents');
  });

  it('Accordion prompts the user to expand it', () => {
    const fixture = TestBed.createComponent(AccordionCommonComponent);
    fixture.detectChanges();
    const prompt: HTMLElement =
      fixture.nativeElement.querySelector('.control-text');
    expect(prompt.textContent?.trim()).toBe('(click to expand)');
  });
});
