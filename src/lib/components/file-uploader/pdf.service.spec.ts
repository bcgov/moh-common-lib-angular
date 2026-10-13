import { TestBed } from '@angular/core/testing';
import { PdfService } from './pdf.service';

// Stand-in for the pdfjs module the real load() dynamically imports, so load()
// itself runs under test rather than being stubbed out.
const pdfjsMock = {
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: jest.fn(),
};

// Hooks called from inside the module factories, so a test can act while load()
// is part-way through its imports.
let onPdfjsImport: (() => void) | undefined;
let onWorkerImport: (() => unknown) | undefined;

jest.mock(
  'pdfjs-dist/legacy/build/pdf.mjs',
  () => {
    onPdfjsImport?.();
    return pdfjsMock;
  },
  { virtual: true }
);

const globalWithWorker = () =>
  globalThis as { pdfjsWorker?: { WorkerMessageHandler?: unknown } };

const pdfjsWorkerMock = { WorkerMessageHandler: {} };

jest.mock(
  'pdfjs-dist/legacy/build/pdf.worker.mjs',
  () => onWorkerImport?.() ?? pdfjsWorkerMock,
  { virtual: true }
);

const noWorkerMessage = 'No "GlobalWorkerOptions.workerSrc" specified.';

// Mirrors the check in pdfjs-dist 4.10.38 legacy/build/pdf.mjs (lines 17493-17505):
// getDocument() throws unless a worker handler is on globalThis or workerSrc is set.
const pdfjsLikeGetDocument = () => {
  if (
    !globalWithWorker().pdfjsWorker?.WorkerMessageHandler &&
    !pdfjsMock.GlobalWorkerOptions.workerSrc
  ) {
    throw new Error(noWorkerMessage);
  }
  return { promise: Promise.resolve('doc') };
};

describe('PdfService', () => {
  let service: PdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfService);
    PdfService.workerSrc = undefined;
    onPdfjsImport = undefined;
    onWorkerImport = undefined;
    // Fresh registry so the module factories (and their hooks) run again in each
    // test.
    jest.resetModules();
    delete globalWithWorker().pdfjsWorker;
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

    it('should not register the bundled worker when a workerSrc is configured', async () => {
      PdfService.workerSrc = 'https://example.test/pdf.worker.mjs';

      await service.getDocument(new ArrayBuffer(8));

      expect(globalWithWorker().pdfjsWorker).toBeUndefined();
    });

    it('should register the bundled worker for pdfjs when no workerSrc is configured', async () => {
      pdfjsMock.GlobalWorkerOptions.workerSrc = 'untouched';

      await service.getDocument(new ArrayBuffer(8));

      expect(pdfjsMock.GlobalWorkerOptions.workerSrc).toBe('untouched');
      expect(globalWithWorker().pdfjsWorker?.WorkerMessageHandler).toBe(
        pdfjsWorkerMock.WorkerMessageHandler
      );
    });

    it('should not call pdfjs getDocument before the worker is registered, even for concurrent first calls', async () => {
      pdfjsMock.getDocument.mockImplementation(pdfjsLikeGetDocument);
      // Holds the worker import open, like a worker chunk still downloading. The
      // gate matters: with the second call made inside the factory the race window
      // is a couple of microtasks, and an early-cache mutant passes once
      // getDocument() gains two awaits.
      let releaseWorker!: () => void;
      const workerFetched = new Promise<void>((r) => (releaseWorker = r));
      onWorkerImport = () => ({
        __esModule: true,
        then: (resolve: (m: unknown) => void) =>
          workerFetched.then(() => resolve(pdfjsWorkerMock)),
      });
      const settle = () => new Promise((r) => setTimeout(r));

      const first = service.getDocument(new ArrayBuffer(8));
      await settle();
      const second = service.getDocument(new ArrayBuffer(8));
      await settle();
      releaseWorker();

      await expect(Promise.all([first, second])).resolves.toEqual([
        'doc',
        'doc',
      ]);
    });

    it('should retry the worker import on a later call after it failed', async () => {
      onWorkerImport = () => {
        onWorkerImport = undefined;
        throw new Error('worker chunk failed');
      };

      await expect(service.getDocument(new ArrayBuffer(8))).rejects.toThrow(
        'uploading a PDF needs pdfjs-dist'
      );

      await service.getDocument(new ArrayBuffer(8));
      expect(globalWithWorker().pdfjsWorker?.WorkerMessageHandler).toBe(
        pdfjsWorkerMock.WorkerMessageHandler
      );
    });

    it('should report a missing pdfjs-dist when the pdfjs import fails', async () => {
      onPdfjsImport = () => {
        throw new Error('Cannot find module');
      };

      await expect(service.getDocument(new ArrayBuffer(8))).rejects.toThrow(
        'moh-common-lib-angular: uploading a PDF needs pdfjs-dist.'
      );
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
