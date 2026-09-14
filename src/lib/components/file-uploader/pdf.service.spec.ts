import { TestBed } from '@angular/core/testing';
import { PdfService } from './pdf.service';

// Stand-in for the pdfjs module the real load() dynamically imports, so load()
// itself runs under test rather than being stubbed out.
const pdfjsMock = {
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: jest.fn(),
};

jest.mock('pdfjs-dist/legacy/build/pdf.mjs', () => pdfjsMock, {
  virtual: true,
});

describe('PdfService', () => {
  let service: PdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfService);
    PdfService.workerSrc = undefined;
    pdfjsMock.GlobalWorkerOptions.workerSrc = '';
    pdfjsMock.getDocument.mockReset();
    pdfjsMock.getDocument.mockReturnValue({ promise: Promise.resolve('doc') });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be provided in root, so consumers need no module wiring', () => {
    expect(TestBed.inject(PdfService)).toBe(service);
  });

  it('should leave workerSrc unset by default, letting pdfjs pick its fallback', () => {
    expect(PdfService.workerSrc).toBeUndefined();
  });

  // These exercise the REAL load(), with only the pdfjs module itself mocked.
  // Stubbing load() and reimplementing its body in the test would assert against
  // the test's own copy of the logic rather than the shipped code.
  describe('load()', () => {
    it('should apply a configured workerSrc to pdfjs', async () => {
      PdfService.workerSrc = 'https://example.test/pdf.worker.mjs';

      await service.getDocument(new ArrayBuffer(8));

      expect(pdfjsMock.GlobalWorkerOptions.workerSrc).toBe(
        'https://example.test/pdf.worker.mjs'
      );
    });

    it('should leave pdfjs alone when no workerSrc is configured', async () => {
      pdfjsMock.GlobalWorkerOptions.workerSrc = 'untouched';

      await service.getDocument(new ArrayBuffer(8));

      expect(pdfjsMock.GlobalWorkerOptions.workerSrc).toBe('untouched');
    });

    // Caching is observable: load() only touches pdfjs behind its `if (!this.pdfjs)`
    // guard, so a workerSrc set after the first call is never applied.
    it('should import pdfjs once and reuse it across calls', async () => {
      await service.getDocument(new ArrayBuffer(8));
      PdfService.workerSrc = 'https://example.test/set-too-late.mjs';
      await service.getDocument(new ArrayBuffer(8));

      expect(pdfjsMock.getDocument).toHaveBeenCalledTimes(2);
      expect(pdfjsMock.GlobalWorkerOptions.workerSrc).toBe('');
    });
  });

  it('should pass the data through to pdfjs getDocument', async () => {
    const data = new ArrayBuffer(8);
    const result = await service.getDocument(data);

    expect(pdfjsMock.getDocument).toHaveBeenCalledWith({ data });
    expect(result).toBe('doc');
  });
});
