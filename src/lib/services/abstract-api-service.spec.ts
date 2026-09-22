import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { AbstractHttpService } from './abstract-api-service';
import { CommonImage } from '../models/images.model';

// AbstractHttpService is abstract; a concrete subclass is required to instantiate it for testing.
class ConcreteHttpService extends AbstractHttpService {
  protected _headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(http: HttpClient) {
    super(http);
  }

  protected handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => error);
  }

  // Expose protected methods publicly so tests can invoke them directly.
  testGet<T>(url: string) {
    return this.get<T>(url);
  }
  testPost<T>(url: string, body: any) {
    return this.post<T>(url, body);
  }
  testUpload(url: string, attachment: CommonImage) {
    return this.uploadAttachment(url, attachment);
  }
  testUUID() {
    return this.generateUUID();
  }
}

// `handleError`'s return type is `Observable<unknown>`, not `Observable<never>`, so an
// implementer that swallows the error and returns a real value compiles with no cast at
// all - not even a single `as`. Before this change, returning `of(error)` here required
// `as unknown as Observable<never>` to satisfy the abstract method.
class SwallowingHttpService extends AbstractHttpService {
  protected _headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(http: HttpClient) {
    super(http);
  }

  protected handleError(error: HttpErrorResponse): Observable<unknown> {
    return of({ swallowed: true, status: error.status });
  }

  testPost<T>(url: string, body: any) {
    return this.post<T>(url, body);
  }
}

describe('AbstractHttpService', () => {
  let service: ConcreteHttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    const http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    service = new ConcreteHttpService(http);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('get() should make a GET request to the provided URL', () => {
    service.testGet<{ id: number }>('/api/data').subscribe();
    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 1 });
  });

  it('post() should make a POST request with the provided body', () => {
    const body = { message: { event: 'test' } };
    service.testPost('/api/log', body).subscribe();
    const req = httpMock.expectOne('/api/log');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('generateUUID() should return a valid UUID v4 string', () => {
    const uuid = service.testUUID();
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuidPattern.test(uuid)).toBe(true);
  });

  it('generateUUID() should return different values on successive calls', () => {
    expect(service.testUUID()).not.toBe(service.testUUID());
  });

  it('handleError() implementer can return a fallback value with no cast, and setupRequest delivers it', () => {
    const service = new SwallowingHttpService(TestBed.inject(HttpClient));
    const results: any[] = [];
    service
      .testPost('/api/log', { message: { event: 'test' } })
      .subscribe((value) => {
        results.push(value);
      });

    const req = httpMock.expectOne('/api/log');
    req.flush('server exploded', { status: 500, statusText: 'Server Error' });

    expect(results).toEqual([{ swallowed: true, status: 500 }]);
  });

  it('uploadAttachment() should POST a Blob to the given URL', () => {
    const image: CommonImage = {
      fileContent: 'data:image/png;base64,iVBORw0KGgo=',
      contentType: 'image/png',
    } as CommonImage;

    service.testUpload('/api/upload', image).subscribe();
    const req = httpMock.expectOne('/api/upload');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof Blob).toBe(true);
    req.flush('ok');
  });
});
