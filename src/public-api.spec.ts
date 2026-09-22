import {
  RequiredMsg,
  InvalidMsg,
  DuplicateMsg,
  RegionCharsMsg,
  replaceLabelTag,
  LabelReplacementTag,
  type CommonImageScaleFactors,
  type PageListInterface,
  type PageList,
  type CommonLogMessage,
} from './public-api';
import { CommonImageScaleFactorsImpl } from './public-api';
import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SharedCoreModule } from './public-api';

// Guards two things added in 2.4.0:
// - The five default error-message constants (and the function that applies them) are
//   reachable from the public entry point, not just from the model file that declares
//   them. A consumer needing `ErrorMessage.required` can now reuse the library's own
//   wording instead of hardcoding it.
// - Four types the exported API already references (CommonImageScaleFactorsImpl,
//   CheckCompleteBaseService, PageStateService, CommonLogger) can be named by a typed
//   consumer.
describe('public-api', () => {
  describe('default error-message constants', () => {
    it('exports RequiredMsg carrying the label tag', () => {
      expect(RequiredMsg).toBe(`${LabelReplacementTag} is required.`);
    });

    it('exports InvalidMsg carrying the label tag', () => {
      expect(InvalidMsg).toBe(`${LabelReplacementTag} is invalid.`);
    });

    it('exports DuplicateMsg carrying the label tag', () => {
      expect(DuplicateMsg).toBe(
        `${LabelReplacementTag} was already used for another family member.`
      );
    });

    it('exports RegionCharsMsg', () => {
      expect(RegionCharsMsg).toContain('letters');
    });

    it('exports replaceLabelTag, substituting the label into a message', () => {
      expect(replaceLabelTag(RequiredMsg, 'Last name')).toBe(
        'Last name is required.'
      );
    });
  });

  describe('leaked types are reachable from the public entry point', () => {
    it('CommonImageScaleFactors types the value CommonImageScaleFactorsImpl.scaleDown() returns', () => {
      const factors: CommonImageScaleFactors = new CommonImageScaleFactorsImpl(
        1,
        1
      );
      const scaled: CommonImageScaleFactors = factors.scaleDown(0.5);
      expect(scaled.widthFactor).toBe(0.5);
      expect(scaled.heightFactor).toBe(0.5);
    });

    it('PageListInterface types a CheckCompleteBaseService.pageCheckList entry', () => {
      const entry: PageListInterface = { route: '/start', isComplete: false };
      expect(entry.route).toBe('/start');
    });

    it('PageList types a PageStateService.pageList entry', () => {
      const entry: PageList = { index: 1, path: '/start', isComplete: false };
      expect(entry.index).toBe(1);
    });

    it('CommonLogMessage types a CommonLogger.log() argument', () => {
      const message: CommonLogMessage = { event: 'navigation' };
      expect(message.event).toBe('navigation');
    });
  });
});

// SharedCoreModule is the point of 2.5.0: an app that still declares its
// components in an NgModule (rather than going standalone) needs a single
// import to get every common-* tag resolving in its templates. A host
// declared, non-standalone, in an NgModule that only imports SharedCoreModule
// exercises exactly that path. If SharedCoreModule dropped DropdownComponent
// from SHARED_CORE_IMPORTS, or omitted it from `exports`, compileComponents()
// below would throw on the unknown 'common-dropdown' element.
/* eslint-disable @angular-eslint/prefer-standalone -- non-standalone is the case under test */
@Component({
  selector: 'shared-core-host',
  standalone: false,
  template: `
    <common-dropdown label="Pick one" [items]="items"></common-dropdown>
    <common-button label="Go"></common-button>
  `,
})
class SharedCoreHostComponent {
  items = ['A', 'B'];
}
/* eslint-enable @angular-eslint/prefer-standalone */

@NgModule({
  declarations: [SharedCoreHostComponent],
  imports: [SharedCoreModule],
})
class SharedCoreHostModule {}

describe('SharedCoreModule', () => {
  it('resolves and renders common-dropdown and another lib component inside a non-standalone NgModule host', async () => {
    await TestBed.configureTestingModule({
      imports: [SharedCoreHostModule],
    }).compileComponents();
    const fixture = TestBed.createComponent(SharedCoreHostComponent);
    fixture.detectChanges();

    const dropdownEl: HTMLElement =
      fixture.nativeElement.querySelector('common-dropdown');
    const buttonEl: HTMLElement =
      fixture.nativeElement.querySelector('common-button');

    expect(dropdownEl).toBeTruthy();
    expect(buttonEl).toBeTruthy();
    // Proves DropdownComponent's own template actually rendered inside the
    // tag - not just that Angular matched an unknown custom element name.
    expect(dropdownEl.querySelector('ng-select')).toBeTruthy();
    expect(buttonEl.textContent).toContain('Go');
  });
});
