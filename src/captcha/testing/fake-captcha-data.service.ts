import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import type { ServerPayload } from '../captcha-data.service';

/**
 * Stands in for CaptchaDataService in stories, so CaptchaComponent can be
 * demonstrated in every CAPTCHA_STATE without a real captcha API. Not
 * exported from src/captcha/public-api.ts, so it never ships.
 */
export class FakeCaptchaDataService {
  constructor(
    public fetchDataResult: Observable<HttpResponse<ServerPayload>> = of(
      new HttpResponse<ServerPayload>({
        body: {
          nonce: 'fake-nonce',
          captcha:
            '<svg width="180" height="60" xmlns="http://www.w3.org/2000/svg">' +
            '<rect width="180" height="60" fill="#eee"/>' +
            '<text x="10" y="38" font-size="28" font-family="monospace">83EQ2P</text>' +
            '</svg>',
          validation: 'fake-validation',
          expiry: '',
        },
      })
    ),
    public verifyCaptchaResult: Observable<
      HttpResponse<{ valid: boolean; jwt?: string }>
    > = of(new HttpResponse({ body: { valid: true, jwt: 'fake-jwt' } }))
  ) {}

  fetchData(): Observable<HttpResponse<ServerPayload>> {
    return this.fetchDataResult;
  }

  verifyCaptcha(): Observable<HttpResponse<{ valid: boolean; jwt?: string }>> {
    return this.verifyCaptchaResult;
  }

  fetchAudio(): Observable<HttpResponse<{ audio: string }>> {
    return of(new HttpResponse({ body: { audio: '' } }));
  }
}
