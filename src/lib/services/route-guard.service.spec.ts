import { TestBed } from '@angular/core/testing';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { RouterModule } from '@angular/router';
import { RouteGuardService } from './route-guard.service';
import { AbstractPgCheckService } from './abstract-pg-check.service';

class MockPgCheckService implements AbstractPgCheckService {
  bypass = false;
  prerequisiteComplete = true;
  pageComplete = true;
  startUrl = '/start';

  canBypassGuards() {
    return this.bypass;
  }
  isPrerequisiteComplete() {
    return this.prerequisiteComplete;
  }
  isPageComplete(_url: string) {
    return this.pageComplete;
  }
  getStartUrl() {
    return this.startUrl;
  }
}

function makeState(url: string): RouterStateSnapshot {
  return { url } as RouterStateSnapshot;
}

const snapshot = {} as ActivatedRouteSnapshot;

describe('RouteGuardService', () => {
  let service: RouteGuardService;
  let mockCheck: MockPgCheckService;
  let router: Router;

  beforeEach(() => {
    mockCheck = new MockPgCheckService();

    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      providers: [
        RouteGuardService,
        { provide: AbstractPgCheckService, useValue: mockCheck },
      ],
    });

    service = TestBed.inject(RouteGuardService);
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('canActivate() should return true when guards are bypassed', () => {
    mockCheck.bypass = true;
    expect(service.canActivate(snapshot, makeState('/any'))).toBe(true);
  });

  it('canActivate() should redirect and return false when prerequisite is incomplete', () => {
    mockCheck.prerequisiteComplete = false;
    expect(service.canActivate(snapshot, makeState('/page-two'))).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith([mockCheck.startUrl]);
  });

  it('canActivate() should return false when page is incomplete', () => {
    mockCheck.pageComplete = false;
    expect(service.canActivate(snapshot, makeState('/page-two'))).toBe(false);
  });

  it('canActivate() should return true when all checks pass', () => {
    expect(service.canActivate(snapshot, makeState('/page-two'))).toBe(true);
  });

  it('canActivateChild() should behave the same as canActivate()', () => {
    mockCheck.bypass = true;
    expect(service.canActivateChild(snapshot, makeState('/any'))).toBe(true);
  });
});
