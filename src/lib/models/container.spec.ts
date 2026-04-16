import { Container } from './container';
import { ContainerService } from '../services/container.service';

describe('Container', () => {
  it('should create an instance', () => {
    const container = new Container();
    expect(container).toBeTruthy();
  });

  it('should have default values', () => {
    const container = new Container();
    expect(container.useDefaultColor).toBe(true);
    expect(container.isLoading).toBe(false);
  });

  describe('convertRouteToTitle()', () => {
    let container: Container;

    beforeEach(() => {
      container = new Container();
    });

    it('should capitalise a single-word route', () => {
      expect(container.convertRouteToTitle('home')).toBe('Home');
    });

    it('should convert hyphenated route to title-cased words', () => {
      expect(container.convertRouteToTitle('personal-info')).toBe(
        'Personal Info'
      );
    });

    it('should handle multi-segment hyphenated routes', () => {
      expect(container.convertRouteToTitle('review-and-submit')).toBe(
        'Review And Submit'
      );
    });
  });

  describe('continue()', () => {
    it('should call containerService.submitButtonClicked() when service is provided', () => {
      const mockService = {
        submitButtonClicked: jest.fn(),
      } as unknown as ContainerService;
      const container = new Container(mockService);
      container.continue();
      expect(mockService.submitButtonClicked).toHaveBeenCalledTimes(1);
    });

    it('should not throw when no containerService is provided', () => {
      const container = new Container();
      expect(() => container.continue()).not.toThrow();
    });
  });
});
