import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CoreBreadcrumbComponent } from './core-breadcrumb.component';

@Component({
  template: `
    <common-core-breadcrumb>
      <div left class="left-content">Left</div>
      <div center class="center-content">Center</div>
      <div right class="right-content">Right</div>
    </common-core-breadcrumb>
  `,
  imports: [CoreBreadcrumbComponent],
})
class HostComponent {}

function createHost(): HTMLElement {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture.nativeElement;
}

describe('CoreBreadcrumbComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoreBreadcrumbComponent, HostComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CoreBreadcrumbComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a nav labelled as a breadcrumb', () => {
    const nav = createHost().querySelector('nav');
    expect(nav).toBeTruthy();
    expect(nav?.getAttribute('aria-label')).toBe('breadcrumb');
    expect(nav?.classList).toContain('breadcrumb');
  });

  it('should project the left, center, and right slots into the nav', () => {
    const nav = createHost().querySelector('nav');
    expect(nav?.querySelector('.left-content')).toBeTruthy();
    expect(nav?.querySelector('.center-content')).toBeTruthy();
    expect(nav?.querySelector('.right-content')).toBeTruthy();
  });

  it('should project the slots in left, center, right order', () => {
    const nav = createHost().querySelector('nav');
    const classes = Array.from(nav?.children ?? []).map((c) => c.className);
    expect(classes).toEqual([
      'left-content',
      'center-content',
      'right-content',
    ]);
  });

  it('should render the nav even when no slots are supplied', () => {
    const fixture = TestBed.createComponent(CoreBreadcrumbComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('nav')).toBeTruthy();
  });
});
