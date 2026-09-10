import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import {
  DefaultPageGuardService,
  BYPASS_GUARDS,
  START_PAGE_URL,
} from './default-page-guard.service';
import { PageStateService } from './page-state.service';

describe('DefaultPageGuardService', () => {
  function buildService(bypass: boolean | null, startUrl: string | null) {
    const providers: any[] = [DefaultPageGuardService, PageStateService];
    if (bypass !== null)
      providers.push({ provide: BYPASS_GUARDS, useValue: bypass });
    if (startUrl !== null)
      providers.push({ provide: START_PAGE_URL, useValue: startUrl });

    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      providers,
    });

    return {
      service: TestBed.inject(DefaultPageGuardService),
      pageState: TestBed.inject(PageStateService),
    };
  }

  it('should be created', () => {
    const { service } = buildService(false, '/start');
    expect(service).toBeTruthy();
  });

  describe('canBypassGuards()', () => {
    it('should return false when BYPASS_GUARDS token is false', () => {
      const { service } = buildService(false, '/start');
      expect(service.canBypassGuards()).toBe(false);
    });

    it('should return true when BYPASS_GUARDS token is true', () => {
      const { service } = buildService(true, '/start');
      expect(service.canBypassGuards()).toBe(true);
    });
  });

  describe('canNavigateToUrl()', () => {
    it('should return true when navigating to start page with empty page list', () => {
      const { service } = buildService(false, '/start');
      expect(service.canNavigateToUrl('/start')).toBe(true);
    });

    it('should redirect and return false when navigating away from start page with empty page list', () => {
      const { service, pageState } = buildService(false, '/start');
      jest.spyOn(pageState, 'navigateByUrl');
      const result = service.canNavigateToUrl('/other');
      expect(result).toBe(false);
      expect(pageState.navigateByUrl).toHaveBeenCalledWith('/start');
    });
  });
});
