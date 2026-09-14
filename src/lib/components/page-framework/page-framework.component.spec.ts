import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageFrameworkComponent } from './page-framework.component';

@Component({
  template: `
    <common-page-framework [layout]="layout">
      <p class="main-content">Main</p>
      <aside class="aside-content">Aside</aside>
    </common-page-framework>
  `,
  imports: [PageFrameworkComponent],
})
class HostComponent {
  layout: 'single' | 'double' | 'blank' | 'default' = 'default';
}

function createHost(
  layout?: 'single' | 'double' | 'blank' | 'default'
): ComponentFixture<HostComponent> {
  const fixture = TestBed.createComponent(HostComponent);
  if (layout) {
    fixture.componentInstance.layout = layout;
  }
  fixture.detectChanges();
  return fixture;
}

describe('PageFrameworkComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageFrameworkComponent, HostComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PageFrameworkComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should default layout to default', () => {
    const fixture = TestBed.createComponent(PageFrameworkComponent);
    expect(fixture.componentInstance.layout).toBe('default');
  });

  it('should render a main column and an aside column for the default layout', () => {
    const el: HTMLElement = createHost('default').nativeElement;
    expect(el.querySelector('.col-md-8')).toBeTruthy();
    expect(el.querySelector('.col-md-4')).toBeTruthy();
  });

  it('should render two equal columns for the double layout', () => {
    const el: HTMLElement = createHost('double').nativeElement;
    expect(el.querySelectorAll('.col-md-6').length).toBe(2);
    expect(el.querySelector('.col-md-4')).toBeNull();
  });

  it('should render one offset column and no aside for the single layout', () => {
    const el: HTMLElement = createHost('single').nativeElement;
    expect(el.querySelector('.col-md-8.offset-lg-2')).toBeTruthy();
    expect(el.querySelector('.col-md-4')).toBeNull();
  });

  it('should render a full width column for the blank layout', () => {
    const el: HTMLElement = createHost('blank').nativeElement;
    expect(el.querySelector('.col-sm-12')).toBeTruthy();
    expect(el.querySelector('.col-md-4')).toBeNull();
  });

  it('should project default content into the main column', () => {
    const el: HTMLElement = createHost('default').nativeElement;
    const main = el.querySelector('.col-md-8');
    expect(main?.querySelector('.main-content')).toBeTruthy();
  });

  it('should project aside content into the aside column', () => {
    const el: HTMLElement = createHost('default').nativeElement;
    const aside = el.querySelector('.col-md-4');
    expect(aside?.querySelector('.aside-content')).toBeTruthy();
  });

  it('should render main content only once when the layout changes', () => {
    const fixture = createHost('default');
    fixture.componentInstance.layout = 'single';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('.main-content').length).toBe(1);
  });
});
