import { Injectable } from '@angular/core';

/**
 * Thin wrapper over pdfjs-dist.
 *
 * It exists for two reasons. It keeps the pdfjs import in one place, so the
 * worker configuration has a single home; and it gives FileUploaderComponent a
 * seam, since pdfjs cannot render in jsdom and would otherwise make the PDF
 * path untestable.
 *
 * pdfjs-dist is an optional peer dependency. The import below is caught so a
 * bundler treats it as resolvable-at-runtime rather than failing the build of
 * an app that never uploads PDFs.
 */
@Injectable({ providedIn: 'root' })
export class PdfService {
  private pdfjs: any;

  /**
   * Where pdfjs should load its worker from. Set this before the first PDF is
   * processed. Left unset, the worker is bundled with the app and pdfjs runs it
   * on the main thread, which works but blocks while rendering.
   */
  static workerSrc: string | undefined;

  /** Loads pdfjs on first use, so it is not pulled in unless a PDF is opened. */
  private async load(): Promise<any> {
    if (!this.pdfjs) {
      // The .catch() on each import is what keeps pdfjs-dist optional. Without
      // it a bundler resolves the specifier at build time and fails when
      // pdfjs-dist is absent.
      const missing = () => {
        throw new Error(
          'moh-common-lib-angular: uploading a PDF needs pdfjs-dist. ' +
            'Install it, or restrict common-file-uploader to images.'
        );
      };
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs').catch(
        missing
      );
      if (PdfService.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = PdfService.workerSrc;
      } else {
        // With no workerSrc, pdfjs reads globalThis.pdfjsWorker and runs that
        // handler on the main thread; with neither, getDocument() throws
        // 'No "GlobalWorkerOptions.workerSrc" specified.'
        const worker = await import(
          // @ts-expect-error pdfjs-dist ships no type declarations for the worker
          'pdfjs-dist/legacy/build/pdf.worker.mjs'
        ).catch(missing);
        (globalThis as { pdfjsWorker?: unknown }).pdfjsWorker = worker;
      }
      // Cached last, so a concurrent or retried call never sees pdfjs without
      // its worker.
      this.pdfjs = pdfjs;
    }
    return this.pdfjs;
  }

  /** Resolves to a pdfjs PDFDocumentProxy for the given file contents. */
  async getDocument(data: ArrayBuffer | Uint8Array): Promise<any> {
    const pdfjs = await this.load();
    return pdfjs.getDocument({ data }).promise;
  }
}
