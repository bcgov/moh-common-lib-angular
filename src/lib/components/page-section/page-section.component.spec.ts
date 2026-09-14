import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageSectionComponent } from './page-section.component';

@Component({
  template: `
    <common-page-section [layout]="layout">
      <p class="main-content">Main</p>
      <aside class="aside-content">Aside</aside>
    </common-page-section>
  `,
  imports: [PageSectionComponent],
})
class HostComponent {
  layout: 'double' | 'tips' | 'noTips' = 'tips';
}

function createHost(
  layout?: 'double' | 'tips' | 'noTips'
): ComponentFixture<HostComponent> {
  const fixture = TestBed.createComponent(HostComponent);
  if (layout) {
    fixture.componentInstance.layout = layout;
  }
  fixture.detectChanges();
  return fixture;
}

describe('PageSectionComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageSectionComponent, HostComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PageSectionComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should default layout to tips', () => {
    const fixture = TestBed.createComponent(PageSectionComponent);
    expect(fixture.componentInstance.layout).toBe('tips');
  });

  it('should render a main column and an aside column for the tips layout', () => {
    const el: HTMLElement = createHost('tips').nativeElement;
    expect(el.querySelector('.col-md-8')).toBeTruthy();
    expect(el.querySelector('.col-md-4')).toBeTruthy();
  });

  it('should render two equal columns for the double layout', () => {
    const el: HTMLElement = createHost('double').nativeElement;
    expect(el.querySelectorAll('.col-md-6').length).toBe(2);
  });

  it('should render a full width column and no aside for the noTips layout', () => {
    const el: HTMLElement = createHost('noTips').nativeElement;
    expect(el.querySelector('.col-md-12')).toBeTruthy();
    expect(el.querySelector('.col-md-4')).toBeNull();
  });

  it('should project default content into the main column', () => {
    const el: HTMLElement = createHost('tips').nativeElement;
    expect(
      el.querySelector('.col-md-8')?.querySelector('.main-content')
    ).toBeTruthy();
  });

  it('should project aside content into the aside column', () => {
    const el: HTMLElement = createHost('tips').nativeElement;
    expect(
      el.querySelector('.col-md-4')?.querySelector('.aside-content')
    ).toBeTruthy();
  });

  it('should render main content only once when the layout changes', () => {
    const fixture = createHost('tips');
    fixture.componentInstance.layout = 'noTips';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('.main-content').length).toBe(1);
  });
});
