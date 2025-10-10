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
    const element = fixture.componentInstance;
    element.title = 'Show Documents';
    expect(element.title).toEqual('Show Documents');
  });
});
