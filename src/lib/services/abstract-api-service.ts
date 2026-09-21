// TODO: code refactor

import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { CommonImage } from '../models/images.model';

/**
 * Abstract class for HTTP Service
 */
export abstract class AbstractHttpService {
  /** Set to true during development to print every request and response to the console. */
  protected logHTTPRequestsToConsole = false;

  constructor(protected http: HttpClient) {}

  /** The headers to send along with every GET and POST. */
  protected abstract _headers: HttpHeaders;

  /**
   * Makes a GET request to the specified URL, using headers and HTTP options specified in their respective methods.
   * @param url Target URL to make the GET request
   */
  protected get<T>(url: string, queryParams?: HttpParams): Observable<T> {
    /** The HTTP request observer with always on error handling */
    const httpOpts = this.httpOptions;
    httpOpts.params = queryParams ? queryParams : undefined;
    const observable = this.http.get(url, httpOpts);
    return this.setupRequest(observable);
  }

  /**
   * Makes a POST request to the specified URL with the given body.
   * @param url Target URL
   * @param body Request payload. Typed as `object` so subclasses can pass any
   * domain-specific shape without being forced into a particular structure.
   */
  protected post<T>(url: string, body: object): Observable<T> {
    if (this.logHTTPRequestsToConsole) {
      console.log('Post Request: ', body);
    }
    const observable = this.http.post(url, body, this.httpOptions);
    return this.setupRequest(observable);
  }

  /** Attaches error handling and optional console logging to any HTTP observable. */
  protected setupRequest<T>(observable: Observable<any>): Observable<T> {
    // All failed requests should trigger the abstract method handleError. handleError's
    // return type is intentionally unknown, not T: it runs before the response is typed,
    // so there is no honest way for it to promise a T. The cast back to Observable<T> is
    // deliberately kept here, in one place, rather than pushed onto every implementer.
    observable = observable.pipe(
      catchError(
        (error: HttpErrorResponse) => this.handleError(error) as Observable<T>
      )
    );
    // Optionally add console logging
    if (this.logHTTPRequestsToConsole) {
      observable = observable.pipe(
        tap(
          (data) => console.log('HTTP Success: ', data),
          (error) => console.log('HTTP Error: ', error)
        )
      );
    }
    return observable;
  }

  /** The HttpOptions object that Angular takes for GET and POST requests. Used in every HTTP request from this service. */
  protected get httpOptions(): { headers: HttpHeaders; params?: HttpParams } {
    return {
      headers: this._headers,
    };
  }

  /**
   * Handles all failed requests that throw either a server error (400/500) or a client
   * error (e.g. lost internet). Rethrowing (the pattern used inside this library) is one
   * valid implementation, but consumers commonly swallow the error and return a fallback
   * value instead, so `Observable<never>` was never honest: it forced anyone doing the
   * latter into an `as unknown as Observable<never>` cast to say the opposite of what they
   * meant. `Observable<unknown>` accepts either shape with no cast; `setupRequest` is the
   * only caller and reconciles the type back to `T` there.
   */
  protected abstract handleError(error: HttpErrorResponse): Observable<unknown>;

  /* Helper function for generating a unique UUID per request for logging. */
  protected generateUUID() {
    return uuidv4();
  }

  /**
   * Uploads an individual attachment.  All you need to do is set the url.
   * Note: urls often include UUIDs, so this must be an application decision.
   *
   * @param relativeUrl URL to hit, must include UUIDs of application and CommonImage
   * @param attachment CommonImage to upload
   */
  protected uploadAttachment(relativeUrl: string, attachment: CommonImage) {
    const options = { headers: this._headers, responseType: 'text' as const };

    const binary = atob(attachment.fileContent.split(',')[1]);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    const blob = new Blob([new Uint8Array(array)], {
      type: attachment.contentType,
    });

    return this.http.post(relativeUrl, blob, options);
  }
}
