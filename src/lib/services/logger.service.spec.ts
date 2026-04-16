import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CommonLogger, CommonLogEvents } from './logger.service';
import { HttpErrorResponse } from '@angular/common/http';

describe('CommonLogger', () => {
  let service: CommonLogger;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CommonLogger],
    });
    service = TestBed.inject(CommonLogger);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('log() should not make an HTTP request when URL has not been set', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    service.log({ event: CommonLogEvents.navigation });
    httpMock.expectNone(() => true);
    expect(console.error).toHaveBeenCalled();
  });

  it('log() should POST to the configured URL', () => {
    service.setURL('/api/log');
    service.log({ event: CommonLogEvents.navigation });
    const req = httpMock.expectOne('/api/log');
    expect(req.request.method).toBe('POST');
    req.flush('ok');
  });

  it('log() should include the event in the request body', () => {
    service.setURL('/api/log');
    service.log({ event: CommonLogEvents.submission });
    const req = httpMock.expectOne('/api/log');
    expect(req.request.body.message.event).toBe(CommonLogEvents.submission);
    req.flush('ok');
  });

  it('logError() should POST to the configured URL', () => {
    service.setURL('/api/log');
    service.logError({ event: CommonLogEvents.error });
    const req = httpMock.expectOne('/api/log');
    expect(req.request.method).toBe('POST');
    req.flush('ok');
  });

  it('applicationId setter/getter should update the header', () => {
    service.applicationId = 'app-123';
    expect(service.applicationId).toBe('app-123');
  });

  it('logHttpError() should POST an error event', () => {
    service.setURL('/api/log');
    const httpError = new HttpErrorResponse({
      status: 500,
      statusText: 'Server Error',
    });
    service.logHttpError(httpError);
    const req = httpMock.expectOne('/api/log');
    expect(req.request.body.message.event).toBe(CommonLogEvents.error);
    req.flush('ok');
  });
});
