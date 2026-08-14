import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import {
  CheckCompleteBaseService,
  PageListInterface,
} from './check-complete-base.service';

const PAGE_LIST: PageListInterface[] = [
  { route: '/page-one', isComplete: false },
  { route: '/page-two', isComplete: false },
  { route: '/page-three', isComplete: false },
];

describe('CheckCompleteBaseService', () => {
  let service: CheckCompleteBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      providers: [CheckCompleteBaseService],
    });
    service = TestBed.inject(CheckCompleteBaseService);
    // Reset to a fresh page list before each test
    service.pageCheckList = PAGE_LIST.map((p) => ({ ...p }));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('canBypassGuards() should return false by default', () => {
    expect(service.canBypassGuards()).toBe(false);
  });

  it('canBypassGuards() should return true when bypassGuards is set', () => {
    service.bypassGuards = true;
    expect(service.canBypassGuards()).toBe(true);
  });

  it('getStartUrl() should return empty string by default', () => {
    expect(service.getStartUrl()).toBe('');
  });

  it('getStartUrl() should return the value set via startUrl setter', () => {
    service.startUrl = '/home';
    expect(service.getStartUrl()).toBe('/home');
  });

  it('isPrerequisiteComplete() should return false when pageCheckList is empty', () => {
    service.pageCheckList = [];
    expect(service.isPrerequisiteComplete()).toBe(false);
  });

  it('isPrerequisiteComplete() should return true when pageCheckList has items', () => {
    expect(service.isPrerequisiteComplete()).toBe(true);
  });

  it('isPageComplete() should return true for the first page (no previous page)', () => {
    expect(service.isPageComplete('/page-one')).toBe(true);
  });

  it('isPageComplete() should return false for page-two when page-one is incomplete', () => {
    expect(service.isPageComplete('/page-two')).toBe(false);
  });

  it('isPageComplete() should return true for page-two when page-one is complete', () => {
    service.pageCheckList[0].isComplete = true;
    expect(service.isPageComplete('/page-two')).toBe(true);
  });

  it('isComplete() should return false when any page is incomplete', () => {
    expect(service.isComplete()).toBe(false);
  });

  it('isComplete() should return true when all pages are complete', () => {
    service.pageCheckList.forEach((p) => (p.isComplete = true));
    expect(service.isComplete()).toBe(true);
  });
});
