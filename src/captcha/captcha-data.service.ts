import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Payload returned from the server. */
export interface ServerPayload {
  nonce: string;
  captcha: string;
  validation: string;
  expiry: string;
}

@Injectable()
export class CaptchaDataService {
  constructor(private httpClient: HttpClient) {}

  public fetchData(
    apiBaseUrl: string,
    nonce: string
  ): Observable<HttpResponse<ServerPayload>> {
    return this.httpClient.post<ServerPayload>(
      apiBaseUrl + '/captcha',
      { nonce: nonce },
      { observe: 'response' }
    );
  }

  public verifyCaptcha(
    apiBaseUrl: string,
    nonce: string,
    answer: string,
    encryptedAnswer: string
  ): Observable<HttpResponse<ServerPayload>> {
    return this.httpClient.post<ServerPayload>(
      apiBaseUrl + '/verify/captcha',
      { nonce: nonce, answer: answer, validation: encryptedAnswer },
      { observe: 'response' }
    );
  }

  public fetchAudio(
    apiBaseUrl: string,
    validation: string,
    translation?: string
  ): Observable<HttpResponse<any>> {
    const payload: { validation: string; translation?: string } = {
      validation: validation,
    };
    if (translation) {
      payload.translation = translation;
    }
    return this.httpClient.post<any>(apiBaseUrl + '/captcha/audio', payload, {
      observe: 'response',
    });
  }
}
