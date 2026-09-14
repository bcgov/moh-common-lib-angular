import { Component } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { WizardProgressBarComponent } from './wizard-progress-bar.component';
import { WizardProgressItem } from '../../models/container';

@Component({ template: 'step one' })
class StepOneComponent {}

@Component({ template: 'step two' })
class StepTwoComponent {}

@Component({ template: 'step three' })
class StepThreeComponent {}

const STEPS: WizardProgressItem[] = [
  { title: 'Step one', route: '/one' },
  { title: 'Step two', route: '/two' },
  { title: 'Step three', route: '/three' },
];

describe('WizardProgressBarComponent', () => {
  let fixture: ComponentFixture<WizardProgressBarComponent>;
  let component: WizardProgressBarComponent;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardProgressBarComponent],
      providers: [
        provideRouter([
          { path: 'one', component: StepOneComponent },
          { path: 'two', component: StepTwoComponent },
          { path: 'three', component: StepThreeComponent },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(WizardProgressBarComponent);
    component = fixture.componentInstance;
    component.progressSteps = STEPS;
  });

  function bar(): HTMLElement {
    return fixture.nativeElement.querySelector('.progress');
  }

  function innerBar(): HTMLElement {
    return fixture.nativeElement.querySelector('.progress-bar');
  }

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render one link per step, with its title and route', () => {
    fixture.detectChanges();
    const links: HTMLAnchorElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('a')
    );
    expect(links.length).toBe(3);
    expect(links.map((a) => a.textContent?.trim())).toEqual([
      'Step one',
      'Step two',
      'Step three',
    ]);
    expect(links[1].getAttribute('href')).toBe('/two');
  });

  it('should expose the progress bar to assistive technology', () => {
    fixture.detectChanges();
    expect(bar().getAttribute('role')).toBe('progressbar');
    expect(bar().getAttribute('aria-valuemin')).toBe('0');
    expect(bar().getAttribute('aria-valuemax')).toBe('100');
    expect(bar().getAttribute('aria-valuenow')).toBe(
      String(component.calculateProgressPercentage())
    );
  });

  describe('getActiveIndex', () => {
    it('should match a url ending in a step route', () => {
      expect(component.getActiveIndex('/two')).toBe(1);
    });

    it('should match a url with a leading segment', () => {
      expect(component.getActiveIndex('/app/three')).toBe(2);
    });

    it('should return -1 when no step matches', () => {
      expect(component.getActiveIndex('/nowhere')).toBe(-1);
    });
  });

  describe('calculateProgressPercentage', () => {
    it('should offset by the half-space space-around adds', () => {
      // Step 1 of 3: (1/3 - 1/6) * 100 = 17
      component.activeIndex = 0;
      expect(component.calculateProgressPercentage()).toBe(17);
    });

    it('should return 50 on the middle step of three', () => {
      component.activeIndex = 1;
      expect(component.calculateProgressPercentage()).toBe(50);
    });

    it('should return 83 on the last step of three, never 100', () => {
      component.activeIndex = 2;
      expect(component.calculateProgressPercentage()).toBe(83);
    });

    it('should return 100 when there are no steps', () => {
      component.progressSteps = [];
      component.activeIndex = 0;
      expect(component.calculateProgressPercentage()).toBe(100);
    });

    it('should return 100 when the active index runs past the last step', () => {
      component.activeIndex = 5;
      expect(component.calculateProgressPercentage()).toBe(100);
    });

    it('should handle an unmatched route without going negative', () => {
      component.activeIndex = -1;
      expect(component.calculateProgressPercentage()).toBe(-17);
    });
  });

  // The component is OnPush and only marks itself dirty from its router
  // subscription, so the width has to be driven through a navigation.
  it('should set the inner bar width from the percentage', fakeAsync(() => {
    fixture.detectChanges();
    router.navigate(['/two']);
    tick();
    fixture.detectChanges();
    expect(innerBar().style.width).toBe('50%');
  }));

  it('should mark the active step and no other', fakeAsync(() => {
    fixture.detectChanges();
    router.navigate(['/two']);
    tick();
    fixture.detectChanges();

    const steps: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.step')
    );
    expect(steps.map((s) => s.classList.contains('active'))).toEqual([
      false,
      true,
      false,
    ]);
  }));

  it('should update the active index on navigation', fakeAsync(() => {
    fixture.detectChanges();
    router.navigate(['/three']);
    tick();
    fixture.detectChanges();
    expect(component.activeIndex).toBe(2);
  }));

  it('should set the active index once on init, before any navigation', () => {
    jest.spyOn(router, 'url', 'get').mockReturnValue('/two');
    fixture.detectChanges();
    expect(component.activeIndex).toBe(1);
  });

  it('should unsubscribe from router events on destroy', fakeAsync(() => {
    fixture.detectChanges();
    const subscription = component['routerEvents$'];
    fixture.destroy();
    expect(subscription?.closed).toBe(true);
  }));

  it('should survive a navigation to a route with no matching step', fakeAsync(() => {
    fixture.detectChanges();
    router.navigate(['/one']);
    tick();
    fixture.detectChanges();
    expect(component.activeIndex).toBe(0);
  }));
});
