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
   * processed. Left unset, pdfjs falls back to running on the main thread,
   * which works but blocks while rendering.
   */
  static workerSrc: string | undefined;

  /** Loads pdfjs on first use, so it is not pulled in unless a PDF is opened. */
  private async load(): Promise<any> {
    if (!this.pdfjs) {
      // The .catch() is what keeps this optional. Without it a bundler resolves
      // the specifier at build time and fails when pdfjs-dist is absent.
      this.pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs').catch(() => {
        throw new Error(
          'moh-common-lib-angular: uploading a PDF needs pdfjs-dist. ' +
            'Install it, or restrict common-file-uploader to images.'
        );
      });
      if (PdfService.workerSrc) {
        this.pdfjs.GlobalWorkerOptions.workerSrc = PdfService.workerSrc;
      }
    }
    return this.pdfjs;
  }

  /** Resolves to a pdfjs PDFDocumentProxy for the given file contents. */
  async getDocument(data: ArrayBuffer | Uint8Array): Promise<any> {
    const pdfjs = await this.load();
    return pdfjs.getDocument({ data }).promise;
  }
}
