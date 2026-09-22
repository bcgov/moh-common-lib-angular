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
