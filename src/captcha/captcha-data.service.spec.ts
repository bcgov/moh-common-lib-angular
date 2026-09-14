import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CaptchaDataService } from './captcha-data.service';

const API = 'https://example.test/api';

describe('CaptchaDataService', () => {
  let service: CaptchaDataService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CaptchaDataService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CaptchaDataService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should post the nonce when fetching a captcha', () => {
    service.fetchData(API, 'nonce-1').subscribe();
    const req = http.expectOne(API + '/captcha');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nonce: 'nonce-1' });
    req.flush({});
  });

  it('should observe the full response when fetching a captcha', () => {
    let status = 0;
    service.fetchData(API, 'nonce-1').subscribe((r) => (status = r.status));
    http
      .expectOne(API + '/captcha')
      .flush({}, { status: 200, statusText: 'OK' });
    expect(status).toBe(200);
  });

  it('should post the answer and validation when verifying', () => {
    service.verifyCaptcha(API, 'nonce-1', 'ABC123', 'encrypted').subscribe();
    const req = http.expectOne(API + '/verify/captcha');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      nonce: 'nonce-1',
      answer: 'ABC123',
      validation: 'encrypted',
    });
    req.flush({});
  });

  it('should omit translation from the audio payload when not supplied', () => {
    service.fetchAudio(API, 'encrypted').subscribe();
    const req = http.expectOne(API + '/captcha/audio');
    expect(req.request.body).toEqual({ validation: 'encrypted' });
    req.flush({});
  });

  it('should include translation in the audio payload when supplied', () => {
    service.fetchAudio(API, 'encrypted', 'fr').subscribe();
    const req = http.expectOne(API + '/captcha/audio');
    expect(req.request.body).toEqual({
      validation: 'encrypted',
      translation: 'fr',
    });
    req.flush({});
  });

  it('should surface an http error to the caller', () => {
    let errorStatus = 0;
    service.fetchData(API, 'nonce-1').subscribe({
      error: (e) => (errorStatus = e.status),
    });
    http
      .expectOne(API + '/captcha')
      .flush('boom', { status: 500, statusText: 'Server Error' });
    expect(errorStatus).toBe(500);
  });
});
