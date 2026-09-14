import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CaptchaComponent, CAPTCHA_STATE } from './captcha.component';
import { CaptchaDataService } from './captcha-data.service';

const API = 'https://example.test/api';

describe('CaptchaComponent', () => {
  let fixture: ComponentFixture<CaptchaComponent>;
  let component: CaptchaComponent;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaptchaComponent],
      providers: [
        CaptchaDataService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CaptchaComponent);
    component = fixture.componentInstance;
    component.apiBaseUrl = API;
    component.nonce = 'nonce-1';
  });

  // Without this, a regression that adds an unwanted request to a URL no test
  // names passes clean. captcha-data.service.spec.ts has the same guard.
  afterEach(() => http.verify());

  /** Renders the component and answers the captcha fetch ngAfterViewInit makes. */
  function init(payload: any = { captcha: '<svg></svg>', validation: 'enc' }) {
    fixture.detectChanges();
    http.expectOne(API + '/captcha').flush(payload);
    fixture.detectChanges();
  }

  it('should create', () => {
    init();
    expect(component).toBeTruthy();
  });

  it('should default language to en', () => {
    expect(component.language).toBe('en');
  });

  it('should fetch a captcha on init and render the image', () => {
    init({ captcha: '<svg id="cap"></svg>', validation: 'enc' });
    expect(component.state).toBe(CAPTCHA_STATE.SUCCESS_FETCH_IMG);
    expect(component.imageContainer.nativeElement.innerHTML).toContain('cap');
  });

  it('should report a fetch failure without throwing', () => {
    fixture.detectChanges();
    http
      .expectOne(API + '/captcha')
      .flush('boom', { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(component.state).toBe(CAPTCHA_STATE.ERROR_FETCH_IMG);
    expect(component.errorFetchingImg).toBe(
      'Error status: 503, status text: Unavailable'
    );
  });

  it('should not verify until the answer reaches six characters', () => {
    init();
    component.answer = 'ABC';
    component.answerChanged({});
    http.expectNone(API + '/verify/captcha');
  });

  it('should verify once the answer reaches six characters', () => {
    init();
    component.answer = 'ABC123';
    component.answerChanged({});
    const req = http.expectOne(API + '/verify/captcha');
    expect(req.request.body).toEqual({
      nonce: 'nonce-1',
      answer: 'ABC123',
      validation: 'enc',
    });
    req.flush({ valid: true, jwt: 'a.jwt.token' });
  });

  it('should emit onValidToken with the jwt when the answer is correct', () => {
    init();
    let token = '';
    component.onValidToken.subscribe((t) => (token = t));
    component.answer = 'ABC123';
    component.answerChanged({});
    http
      .expectOne(API + '/verify/captcha')
      .flush({ valid: true, jwt: 'a.jwt.token' });
    expect(token).toBe('a.jwt.token');
    expect(component.state).toBe(CAPTCHA_STATE.SUCCESS_VERIFY_ANSWER_CORRECT);
  });

  it('should clear the answer and fetch a new captcha when the answer is wrong', () => {
    init();
    component.answer = 'ABC123';
    component.answerChanged({});
    http.expectOne(API + '/verify/captcha').flush({ valid: false });
    expect(component.incorrectAnswer).toBe(true);
    expect(component.answer).toBe('');
    http.expectOne(API + '/captcha').flush({ captcha: '', validation: 'enc2' });
  });

  it('should treat a 200 with no valid property as a verify error', () => {
    init();
    component.answer = 'ABC123';
    component.answerChanged({});
    http.expectOne(API + '/verify/captcha').flush({ unexpected: true });
    expect(component.state).toBe(CAPTCHA_STATE.ERROR_VERIFY);
  });

  it('should treat an empty 200 body as a verify error', () => {
    init();
    component.answer = 'ABC123';
    component.answerChanged({});
    http.expectOne(API + '/verify/captcha').flush(null);
    expect(component.state).toBe(CAPTCHA_STATE.ERROR_VERIFY);
  });

  it('should report a verify http failure', () => {
    init();
    component.answer = 'ABC123';
    component.answerChanged({});
    http
      .expectOne(API + '/verify/captcha')
      .flush('boom', { status: 500, statusText: 'Server Error' });
    expect(component.state).toBe(CAPTCHA_STATE.ERROR_VERIFY);
    expect(component.errorVerifyAnswer).toBe(
      'Error status: 500, status text: Server Error'
    );
  });

  it('should clear incorrectAnswer once the answer drops below six characters', () => {
    init();
    component.incorrectAnswer = true;
    component.answer = 'AB';
    component.answerChanged({});
    expect(component.incorrectAnswer).toBeNull();
  });

  it('should refetch after a delay when retrying', fakeAsync(() => {
    init();
    component.retryFetchCaptcha();
    expect(component.state).toBeUndefined();
    tick(100);
    http.expectOne(API + '/captcha').flush({ captcha: '', validation: 'enc3' });
    expect(component.state).toBe(CAPTCHA_STATE.SUCCESS_FETCH_IMG);
  }));

  it('should fetch audio eagerly only when eagerFetchAudio is the string true', () => {
    component.eagerFetchAudio = 'true';
    init();
    http
      .expectOne(API + '/captcha/audio')
      .flush({ audio: 'data:audio/wav;base64,AA' });
    expect(component.audio).toBe('data:audio/wav;base64,AA');
  });

  it('should not fetch audio eagerly by default', () => {
    init();
    http.expectNone(API + '/captcha/audio');
  });

  it('should fetch audio on play when none is loaded', () => {
    init();
    component.playAudio();
    const req = http.expectOne(API + '/captcha/audio');
    expect(req.request.body).toEqual({ validation: 'enc', translation: 'en' });
    req.flush({ audio: 'data:audio/wav;base64,AA' });
    expect(component.fetchingAudioInProgress).toBe(false);
  });

  it('should clear the in-progress flag when the audio fetch fails', () => {
    init();
    component.playAudio();
    http
      .expectOne(API + '/captcha/audio')
      .flush('boom', { status: 500, statusText: 'Server Error' });
    expect(component.fetchingAudioInProgress).toBe(false);
  });

  it('should not start a second audio fetch while one is in progress', () => {
    init();
    component.playAudio();
    http.expectOne(API + '/captcha/audio');
    component.playAudio();
    http.expectNone(API + '/captcha/audio');
  });

  it('should write a value through the control value accessor', () => {
    init();
    component.writeValue('XYZ789');
    expect(component.answer).toBe('XYZ789');
  });

  it('should mark touched on blur', () => {
    init();
    let touched = false;
    component.registerOnTouched(() => (touched = true));
    component.onBlur();
    expect(touched).toBe(true);
  });

  it('should notify the form when a six character answer is entered', () => {
    init();
    let changed = false;
    component.registerOnChange(() => (changed = true));
    component.answer = 'ABC123';
    component.answerChanged({});
    http.expectOne(API + '/verify/captcha').flush({ valid: true, jwt: 'x' });
    expect(changed).toBe(true);
  });

  it('should expose a global refresh hook on init', () => {
    init();
    expect(typeof (window as any)['ca.bcgov.captchaRefresh']).toBe('function');
  });

  // ngOnChanges was simplified from a nested guard whose reloadCaptcha branch
  // could never run. These pin the surviving behaviour in both directions.
  describe('ngOnChanges', () => {
    it('should refetch when the language changes and audio is already loaded', () => {
      init();
      component.audio = 'data:audio/wav;base64,AA';

      component.ngOnChanges({ language: { currentValue: 'fr' } } as any);

      http
        .expectOne(API + '/captcha')
        .flush({ captcha: '', validation: 'enc2' });
    });

    it('should not refetch when the language changes but no audio is loaded', () => {
      init();
      expect(component.audio).toBe('');

      component.ngOnChanges({ language: { currentValue: 'fr' } } as any);

      http.expectNone(API + '/captcha');
    });

    it('should not refetch when something other than the language changes', () => {
      init();
      component.audio = 'data:audio/wav;base64,AA';

      component.ngOnChanges({ nonce: { currentValue: 'n2' } } as any);

      http.expectNone(API + '/captcha');
    });
  });

  it('should fall back to English when the language has no translation', () => {
    component.language = 'xx';
    init();
    expect(component.translatedMessages.playAudio['xx']).toBeUndefined();
    expect(component.translatedMessages.playAudio['en']).toBe('Play Audio');
  });

  it('should carry a translation for every supported language', () => {
    const languages = ['en', 'zh', 'fr', 'pa'];
    Object.values(component.translatedMessages).forEach((message) => {
      languages.forEach((lang) => expect(message[lang]).toBeTruthy());
    });
  });
});
