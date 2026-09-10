import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RouterModule } from '@angular/router';
import { LoadPageGuardService } from './load-page-guard.service';
import { AbstractPageGuardService } from './abstract-page-guard.service';

// Minimal stand-in for AbstractPageGuardService; toggling bypass/canNavigate
// controls which branch of LoadPageGuardService.canActivate() is exercised.
class MockPageGuardService implements AbstractPageGuardService {
  bypass = false;
  canNavigate = true;

  canBypassGuards() {
    return this.bypass;
  }
  canNavigateToUrl(_url: string) {
    return this.canNavigate;
  }
}

function makeState(url: string): RouterStateSnapshot {
  return { url } as RouterStateSnapshot;
}

const snapshot = {} as ActivatedRouteSnapshot;

describe('LoadPageGuardService', () => {
  let service: LoadPageGuardService;
  let mockGuard: MockPageGuardService;

  beforeEach(() => {
    mockGuard = new MockPageGuardService();

    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      providers: [
        LoadPageGuardService,
        { provide: AbstractPageGuardService, useValue: mockGuard },
      ],
    });

    service = TestBed.inject(LoadPageGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('canActivate() should return true when guards are bypassed', () => {
    mockGuard.bypass = true;
    expect(service.canActivate(snapshot, makeState('/any'))).toBe(true);
  });

  it('canActivate() should delegate to canNavigateToUrl() when not bypassed', () => {
    mockGuard.canNavigate = true;
    expect(service.canActivate(snapshot, makeState('/page'))).toBe(true);
  });

  it('canActivate() should return false when canNavigateToUrl() returns false', () => {
    mockGuard.canNavigate = false;
    expect(service.canActivate(snapshot, makeState('/page'))).toBe(false);
  });

  it('canActivateChild() should behave the same as canActivate()', () => {
    mockGuard.bypass = true;
    expect(service.canActivateChild(snapshot, makeState('/any'))).toBe(true);

    mockGuard.bypass = false;
    mockGuard.canNavigate = false;
    expect(service.canActivateChild(snapshot, makeState('/page'))).toBe(false);
  });
});
